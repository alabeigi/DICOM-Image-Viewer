'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import Hammer from 'hammerjs';
import cornerstoneMath from 'cornerstone-math';
import {
  UploadIcon,
  FileIcon,
  ViewIcon,
  CloseIcon,
  UsersIcon,
  LayersIcon,
  ImageIcon,
  SunIcon,
  MoonIcon,
  ZoomInIcon,
  ZoomOutIcon,
  PanIcon,
  WindowLevelIcon,
  InvertIcon,
  ResetIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoCircleIcon,
} from './Icons';
import { ImageMetadata, Toast } from './DicomViewer.types';
import {
  getModalityClass,
  truncateUID,
  formatFileSize,
  formatDate,
  formatPatientName,
} from './utils';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';

const LOG_PREFIX = '[DicomViewer]';

const getFileKey = (file: File): string => `${file.name}:${file.size}:${file.lastModified}`;

const mergeMetadata = (
  prev: ImageMetadata[],
  entries: ImageMetadata[],
): { next: ImageMetadata[]; added: number } => {
  const seenKeys = new Set<string>();
  prev.forEach((entry) => entry.files.forEach((f) => seenKeys.add(getFileKey(f))));

  const next = prev.map((entry) => ({
    ...entry,
    files: [...entry.files],
    totalSize: entry.totalSize,
  }));
  let added = 0;

  for (const newEntry of entries) {
    const freshFiles = newEntry.files.filter((f) => {
      const key = getFileKey(f);
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    });
    if (freshFiles.length === 0) continue;

    added += freshFiles.length;
    const existing = next.find((d) => d.patientID === newEntry.patientID);
    if (existing) {
      existing.files.push(...freshFiles);
      existing.totalSize = existing.files.reduce((sum, f) => sum + f.size, 0);
    } else {
      next.push({
        ...newEntry,
        files: freshFiles,
        totalSize: freshFiles.reduce((sum, f) => sum + f.size, 0),
      });
    }
  }

  return { next, added };
};

const DicomViewer = () => {
  const t = useTranslations();
  const [metadata, setMetadata] = useState<ImageMetadata[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedMetadata, setSelectedMetadata] = useState<ImageMetadata | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('dicom-viewer-theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const [activeTool, setActiveTool] = useState<string>('Wwwc');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const imageRefs = useRef<HTMLDivElement[]>([]);
  const enabledElementsRef = useRef<Set<HTMLDivElement>>(new Set());
  const metadataRef = useRef<ImageMetadata[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableCardRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);
  const toastTimeoutsRef = useRef<Map<number | string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneWADOImageLoader.configure({});

    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.Hammer = Hammer;
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.init();
  }, []);

  useEffect(() => {
    metadataRef.current = metadata;
  }, [metadata]);

  useEffect(() => {
    const currentImageRefs = imageRefs.current;
    const currentToastTimeouts = toastTimeoutsRef.current;

    return () => {
      currentImageRefs.forEach((element) => {
        if (element) {
          try {
            cornerstoneTools.removeToolForElement(element, 'Wwwc');
            cornerstoneTools.removeToolForElement(element, 'Pan');
            cornerstoneTools.removeToolForElement(element, 'Zoom');
            cornerstone.disable(element);
          } catch (err) {
            console.warn(`${LOG_PREFIX} Failed to cleanup cornerstone element during unmount`, err);
          }
        }
      });

      currentToastTimeouts.forEach((timeout) => clearTimeout(timeout));
      currentToastTimeouts.clear();
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dicom-viewer-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);

    const timeout1 = setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      const timeout2Key = `toast-exit-${id}`;
    const timeout2 = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        toastTimeoutsRef.current.delete(timeout2Key);
      }, 300);
      toastTimeoutsRef.current.set(timeout2Key, timeout2);
    }, 3500);
    toastTimeoutsRef.current.set(id, timeout1);
  }, []);

  const removeToast = useCallback((id: number) => {
    const existingTimeout = toastTimeoutsRef.current.get(id);
    if (existingTimeout) clearTimeout(existingTimeout);
    toastTimeoutsRef.current.delete(id);

    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
    toastTimeoutsRef.current.set(id, timeout);
  }, []);

  const setupToolsForElement = useCallback((element: HTMLDivElement) => {
    cornerstoneTools.addToolForElement(element, cornerstoneTools.WwwcTool);
    cornerstoneTools.addToolForElement(element, cornerstoneTools.PanTool);
    cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTool);
    cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
    cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 4 });
    cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 2 });
  }, []);

  const cleanupCornerstone = useCallback(() => {
    imageRefs.current.forEach((element) => {
      if (element) {
        try {
          cornerstoneTools.removeToolForElement(element, 'Wwwc');
          cornerstoneTools.removeToolForElement(element, 'Pan');
          cornerstoneTools.removeToolForElement(element, 'Zoom');
          cornerstone.disable(element);
        } catch (err) {
          console.warn(`${LOG_PREFIX} Failed to cleanup cornerstone element`, err);
        }
      }
    });
    imageRefs.current = [];
    enabledElementsRef.current.clear();
  }, []);

  useEffect(() => {
    if (!open || selectedImages.length === 0) return;

    let cancelled = false;
    const MAX_CONCURRENT = 3;
    let nextIndex = 0;

    const worker = async () => {
      while (!cancelled) {
        const index = nextIndex++;
        if (index >= selectedImages.length) return;
        const file = selectedImages[index];
        const element = imageRefs.current[index];
        if (!element) continue;
        try {
          if (!enabledElementsRef.current.has(element)) {
            cornerstone.enable(element);
            enabledElementsRef.current.add(element);
            setupToolsForElement(element);
          }
          const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
          const image = await cornerstone.loadImage(imageId);
          if (cancelled) return;
          cornerstone.displayImage(element, image);
        } catch (err) {
          console.error(`${LOG_PREFIX} Failed to load DICOM image: "${file.name}" (index ${index})`, err);
        }
      }
    };

    Array.from(
      { length: Math.min(MAX_CONCURRENT, selectedImages.length) },
      () => worker(),
    );

    return () => {
      cancelled = true;
    };
  }, [open, selectedImages, setupToolsForElement]);

  const switchTool = useCallback((toolName: string) => {
    const element = imageRefs.current[0];
    if (!element) return;
    try {
      cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
      setActiveTool(toolName);
    } catch (err) {
      console.warn(`${LOG_PREFIX} Failed to switch tool to "${toolName}"`, err);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    imageRefs.current.forEach((element) => {
      if (element) {
        const viewport = cornerstone.getViewport(element);
        if (viewport) {
          viewport.scale *= 1.2;
          cornerstone.setViewport(element, viewport);
        }
      }
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    imageRefs.current.forEach((element) => {
      if (element) {
        const viewport = cornerstone.getViewport(element);
        if (viewport) {
          viewport.scale /= 1.2;
          cornerstone.setViewport(element, viewport);
        }
      }
    });
  }, []);

  const handleInvert = useCallback(() => {
    let inverted = false;
    imageRefs.current.forEach((element, i) => {
      if (element) {
        const viewport = cornerstone.getViewport(element);
        if (viewport) {
          viewport.invert = !viewport.invert;
          cornerstone.setViewport(element, viewport);
          if (i === 0) inverted = viewport.invert;
        }
      }
    });
    addToast('info', inverted ? t('toast.imageInverted') : t('toast.imageNormal'));
  }, [addToast, t]);

  const handleReset = useCallback(() => {
    imageRefs.current.forEach((element) => {
      if (element) {
        cornerstone.reset(element);
      }
    });
    addToast('info', t('toast.viewReset'));
  }, [addToast, t]);

  const processFiles = useCallback(async (files: File[]) => {
    setIsLoading(true);

    const parseFile = async (file: File): Promise<ImageMetadata | null> => {
      if (!file.name.toLowerCase().endsWith('.dcm')) return null;
      try {
        const buffer = await file.arrayBuffer();
        const dataSet = dicomParser.parseDicom(new Uint8Array(buffer));
        const patientID = dataSet.string('x00100020') || 'Unknown';
        const patientName = formatPatientName(dataSet.string('x00100010') || '');
        const modality = dataSet.string('x00080060') || 'Unknown';
        const seriesInstanceUID = dataSet.string('x0020000e') || 'Unknown';
        const studyInstanceUID = dataSet.string('x0020000d') || 'Unknown';
        const studyDate = formatDate(dataSet.string('x00080020') || '');
        return {
          patientID,
          patientName,
          modality,
          seriesInstanceUID,
          studyInstanceUID,
          studyDate,
          files: [file],
          totalSize: file.size,
        };
      } catch (err) {
        console.error(`${LOG_PREFIX} Failed to parse DICOM file: "${file.name}"`, err);
        addToast('error', t('toast.parseError', { file: file.name }));
        return null;
      }
    };

    const results = await Promise.all(files.map(parseFile));
    const validResults = results.filter((r): r is ImageMetadata => r !== null);

    if (validResults.length > 0) {
      const { next, added } = mergeMetadata(metadataRef.current, validResults);
      setMetadata(next);

      if (added > 0) {
        addToast('success', t('toast.filesLoaded', { count: added }));
      }
    }

    setIsLoading(false);
  }, [addToast, t]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(Array.from(event.target.files));
      event.target.value = '';
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.name.toLowerCase().endsWith('.dcm')
    );
    if (files.length > 0) {
      processFiles(files);
    } else {
      addToast('error', t('toast.noValidFiles'));
    }
  }, [processFiles, addToast, t]);

  const handleZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleZoneKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  const handleOpenModal = useCallback((files: File[], meta: ImageMetadata) => {
    cleanupCornerstone();
    const seen = new Set<string>();
    const uniqueFiles = files.filter((f) => {
      const key = getFileKey(f);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setSelectedImages(uniqueFiles);
    setSelectedMetadata(meta);
    setActiveTool('Wwwc');
    setOpen(true);
  }, [cleanupCornerstone]);

  const handleCloseModal = useCallback(() => {
    cleanupCornerstone();
    setOpen(false);
    setSelectedImages([]);
    setSelectedMetadata(null);
  }, [cleanupCornerstone]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'Escape':
          handleCloseModal();
          break;
        case 'i':
        case 'I':
          handleInvert();
          break;
        case 'r':
        case 'R':
          handleReset();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'w':
        case 'W':
          switchTool('Wwwc');
          break;
        case 'p':
        case 'P':
          switchTool('Pan');
          break;
        case 'z':
        case 'Z':
          switchTool('Zoom');
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleCloseModal, handleInvert, handleReset, handleZoomIn, handleZoomOut, switchTool]);

  const prevHasFilesRef = useRef(false);

  const totalFiles = metadata.reduce((acc, m) => acc + m.files.length, 0);
  const totalPatients = metadata.length;
  const totalSize = metadata.reduce((acc, m) => acc + m.totalSize, 0);
  const hasFiles = metadata.length > 0;

  useEffect(() => {
    if (hasFiles && !prevHasFilesRef.current) {
      requestAnimationFrame(() => {
        if (tableCardRef.current) {
          tableCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          tableCardRef.current.focus();
        }
      });
    }
    prevHasFilesRef.current = hasFiles;
  }, [hasFiles]);

  return (
    <main>
      <div className="container">
        <div className="app-header">
          <div className="header-controls">
            <LanguageSwitcher />
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
          <h1>{t('app.title')}</h1>
          <p>{t('app.description')}</p>
        </div>

        <div
          className={`upload-zone ${isDragging ? 'dragging' : ''} ${hasFiles ? 'has-files' : ''}`}
          onClick={handleZoneClick}
          onKeyDown={handleZoneKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label={t('upload.subtitle')}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="upload-file-input"
            accept=".dcm"
            multiple
            onChange={handleFileChange}
            tabIndex={-1}
            aria-hidden="true"
          />
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner" />
              <span className="loading-text">{t('upload.parsing')}</span>
            </div>
          )}
          <div className="upload-icon">
            <UploadIcon />
          </div>
          <div className="upload-title">
            {isDragging ? t('upload.titleDrag') : t('upload.title')}
          </div>
          <div className="upload-subtitle">
            {t('upload.subtitle')}
          </div>
          <div className="upload-hint">
            <FileIcon />
            <span>{t('upload.hint')}</span>
          </div>
        </div>

        {hasFiles && (
          <div className="stats-bar" role="status" aria-label={t('stats.ariaLabel')}>
            <div className="stat-item">
              <div className="stat-icon"><UsersIcon /></div>
              <div className="stat-info">
                <span className="stat-value">{totalPatients}</span>
                <span className="stat-label">{t('stats.patients', { count: totalPatients })}</span>
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-icon"><LayersIcon /></div>
              <div className="stat-info">
                <span className="stat-value">{metadata.length}</span>
                <span className="stat-label">{t('stats.series')}</span>
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-icon"><ImageIcon /></div>
              <div className="stat-info">
                <span className="stat-value">{totalFiles}</span>
                <span className="stat-label">{t('stats.images')}</span>
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-icon"><FileIcon /></div>
              <div className="stat-info">
                <span className="stat-value">{formatFileSize(totalSize)}</span>
                <span className="stat-label">{t('stats.totalSize')}</span>
              </div>
            </div>
          </div>
        )}

        {hasFiles && (
          <div className="shortcuts-hint">
            <span>{t('shortcuts.title')}</span>
            <kbd>I</kbd> {t('shortcuts.invert')}
            <kbd>R</kbd> {t('shortcuts.reset')}
            <kbd>+</kbd><kbd>-</kbd> {t('shortcuts.zoom')}
            <kbd>W</kbd> W/L
            <kbd>P</kbd> {t('toolbar.pan')}
            <kbd>Esc</kbd> {t('shortcuts.close')}
          </div>
        )}

        {hasFiles ? (
          <div className="table-card" ref={tableCardRef} tabIndex={-1} style={{ outline: 'none' }}>
            <div className="table-header">
              <span className="table-title">{t('table.title')}</span>
            </div>
            <div className="table-wrapper">
              <table className="dicom-table" aria-label={t('table.ariaLabel')}>
                <thead>
                  <tr>
                    <th scope="col">{t('table.patient')}</th>
                    <th scope="col">{t('table.modality')}</th>
                    <th scope="col">{t('table.studyDate')}</th>
                    <th scope="col">{t('table.seriesUID')}</th>
                    <th scope="col">{t('table.studyUID')}</th>
                    <th scope="col">{t('table.images')}</th>
                    <th scope="col">{t('table.size')}</th>
                    <th scope="col" style={{ textAlign: 'right' }}>{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {metadata.map((data, index) => (
                    <tr key={index}>
                      <td>
                        <div>
                          <span className="patient-badge">
                            <span className="patient-badge-dot" aria-hidden="true" />
                            {data.patientID}
                          </span>
                          {data.patientName !== 'Unknown' && (
                            <div className="patient-name">{data.patientName}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`modality-tag ${getModalityClass(data.modality)}`}>
                          {data.modality}
                        </span>
                      </td>
                      <td>
                        <span className="study-date">{data.studyDate}</span>
                      </td>
                      <td>
                        <span className="uid-text" title={data.seriesInstanceUID}>
                          {truncateUID(data.seriesInstanceUID)}
                        </span>
                      </td>
                      <td>
                        <span className="uid-text" title={data.studyInstanceUID}>
                          {truncateUID(data.studyInstanceUID)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {data.files.length}
                        </span>
                      </td>
                      <td>
                        <span className="file-size">{formatFileSize(data.totalSize)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="view-btn"
                          onClick={() => handleOpenModal(data.files, data)}
                          aria-label={t('modal.imageLabel', { index: data.patientID })}
                        >
                          <ViewIcon />
                          {t('table.view')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ImageIcon />
            </div>
            <h3>{t('empty.title')}</h3>
            <p>{t('empty.description')}</p>
          </div>
        )}

        {open && (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={t('modal.ariaLabel')}
            onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-title-group">
                  <span className="modal-title">{t('modal.title')}</span>
                  <span className="modal-image-count">
                    {t('modal.imageCount', { count: selectedImages.length })}
                  </span>
                  {selectedMetadata && (
                    <>
                      <span className="modal-image-count" style={{ background: 'rgba(0, 191, 165, 0.15)', color: 'var(--color-accent-dark)' }}>
                        {selectedMetadata.patientID}
                      </span>
                      <span className="modal-image-count" style={{ background: 'rgba(0, 191, 165, 0.15)', color: 'var(--color-accent-dark)' }}>
                        {selectedMetadata.modality}
                      </span>
                    </>
                  )}
                </div>
                <button
                  className="modal-close"
                  onClick={handleCloseModal}
                  aria-label={t('modal.closeLabel')}
                  autoFocus
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="viewer-toolbar" role="toolbar" aria-label={t('modal.viewerAriaLabel')}>
                <div className="toolbar-group">
                  <button
                    className={`toolbar-btn ${activeTool === 'Wwwc' ? 'active' : ''}`}
                    onClick={() => switchTool('Wwwc')}
                    aria-label={t('toolbar.windowLevel')}
                    title={t('toolbar.windowLevel')}
                  >
                    <WindowLevelIcon />
                    <span className="toolbar-btn-tooltip">{t('toolbar.windowLevel')} <span className="toolbar-shortcut">W</span></span>
                  </button>
                  <button
                    className={`toolbar-btn ${activeTool === 'Pan' ? 'active' : ''}`}
                    onClick={() => switchTool('Pan')}
                    aria-label={t('toolbar.pan')}
                    title={t('toolbar.pan')}
                  >
                    <PanIcon />
                    <span className="toolbar-btn-tooltip">{t('toolbar.pan')} <span className="toolbar-shortcut">P</span></span>
                  </button>
                  <button
                    className={`toolbar-btn ${activeTool === 'Zoom' ? 'active' : ''}`}
                    onClick={() => switchTool('Zoom')}
                    aria-label={t('toolbar.zoom')}
                    title={t('toolbar.zoom')}
                  >
                    <ZoomInIcon />
                    <span className="toolbar-btn-tooltip">{t('toolbar.zoom')} <span className="toolbar-shortcut">Z</span></span>
                  </button>
                </div>
                <div className="toolbar-group">
                  <button className="toolbar-btn" onClick={handleZoomIn} aria-label={t('toolbar.zoomIn')} title={t('toolbar.zoomIn')}>
                    <ZoomInIcon />
                    <span className="toolbar-btn-tooltip">{t('toolbar.zoomIn')} <span className="toolbar-shortcut">+</span></span>
                  </button>
                  <button className="toolbar-btn" onClick={handleZoomOut} aria-label={t('toolbar.zoomOut')} title={t('toolbar.zoomOut')}>
                    <ZoomOutIcon />
                    <span className="toolbar-btn-tooltip">{t('toolbar.zoomOut')} <span className="toolbar-shortcut">-</span></span>
                  </button>
                </div>
                <div className="toolbar-group">
                  <button className="toolbar-btn" onClick={handleInvert} aria-label={t('toolbar.invert')} title={t('toolbar.invert')}>
                    <InvertIcon />
                    <span className="toolbar-btn-tooltip">{t('toolbar.invert')} <span className="toolbar-shortcut">I</span></span>
                  </button>
                  <button className="toolbar-btn" onClick={handleReset} aria-label={t('toolbar.reset')} title={t('toolbar.reset')}>
                    <ResetIcon />
                    <span className="toolbar-btn-tooltip">{t('toolbar.reset')} <span className="toolbar-shortcut">R</span></span>
                  </button>
                </div>
              </div>

              <div className="modal-body">
                {selectedImages.map((file, index) => (
                  <div key={index} className="image-item" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="image-label">
                      <span className="image-label-text">{t('modal.imageLabel', { index: index + 1 })}</span>
                      <span className="image-label-filename">{file.name}</span>
                    </div>
                    <div
                      ref={(el) => { if (el) imageRefs.current[index] = el; }}
                      className="image-viewport"
                      role="img"
                      aria-label={t('modal.imageLabel', { index: index + 1 })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="toast-container" aria-live="polite" aria-atomic="true">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type} ${toast.exiting ? 'exiting' : ''}`}>
              <div className="toast-icon">
                {toast.type === 'success' && <CheckCircleIcon />}
                {toast.type === 'error' && <AlertCircleIcon />}
                {toast.type === 'info' && <InfoCircleIcon />}
              </div>
              <span className="toast-message">{toast.message}</span>
              <button className="toast-close" onClick={() => removeToast(toast.id)} aria-label={t('toast.dismiss')}>
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default React.memo(DicomViewer);
