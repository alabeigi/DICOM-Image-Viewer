'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Box,
  Typography,
} from '@mui/material';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

interface ImageMetadata {
  patientID: string;
  modality: string;
  seriesInstanceUID: string;
  studyInstanceUID: string;
  files: File[];
}

const DicomViewer = () => {
  const [metadata, setMetadata] = useState<ImageMetadata[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const imageRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneWADOImageLoader.configure({});
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);

      filesArray.forEach(async (file) => {
        const dataSet = dicomParser.parseDicom(
          new Uint8Array(await file.arrayBuffer()),
        );
        const patientID = dataSet.string('x00100020') || 'Unknown';
        const modality = dataSet.string('x00080060') || 'Unknown';
        const seriesInstanceUID = dataSet.string('x0020000e') || 'Unknown';
        const studyInstanceUID = dataSet.string('x0020000d') || 'Unknown';

        setMetadata((prevMetadata) => {
          const existingPatient = prevMetadata.find(
            (data) => data.patientID === patientID,
          );
          if (existingPatient) {
            existingPatient.files.push(file);
            return [...prevMetadata];
          } else {
            return [
              ...prevMetadata,
              {
                patientID,
                modality,
                seriesInstanceUID,
                studyInstanceUID,
                files: [file],
              },
            ];
          }
        });
      });
    }
  };

  const handleOpenModal = (files: File[]) => {
    const uniqueFiles = Array.from(new Set(files.map((file) => file.name))).map(
      (uniqueFileName) => {
        return files.find((file) => file.name === uniqueFileName);
      },
    ) as File[];

    setSelectedImages(uniqueFiles);
    setOpen(true);
    setTimeout(() => {
      uniqueFiles.forEach((file, index) => {
        loadImage(file, index);
      });
    }, 0);
  };

  const handleCloseModal = useCallback(() => {
    setOpen(false);
    setSelectedImages([]);
  }, [setOpen, setSelectedImages]);

  const loadImage = async (file: File, index: number) => {
    const element = imageRefs.current[index];
    if (element) {
      cornerstone.enable(element);
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      const image = await cornerstone.loadImage(imageId);
      cornerstone.displayImage(element, image);
    }
  };

  return (
    <main>
      <div className="container">
        <input type="file" accept=".dcm" multiple onChange={handleFileChange} />
        {metadata.length ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient ID</TableCell>
                  <TableCell>Modality</TableCell>
                  <TableCell>Series Instance UID</TableCell>
                  <TableCell>Study Instance UID</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metadata.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.patientID}</TableCell>
                    <TableCell>{data.modality}</TableCell>
                    <TableCell>{data.seriesInstanceUID}</TableCell>
                    <TableCell>{data.studyInstanceUID}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => handleOpenModal(data.files)}
                      >
                        Show Images
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </div>
      <Modal open={open} onClose={handleCloseModal}>
        <Box className="box">
          <Typography variant="h6" component="h2" textAlign="center">
            DICOM Images
          </Typography>
          <div className="image-container">
            {selectedImages.map((_, index) => (
              <div key={index}>
                <div
                  ref={(el) => {
                    if (el) imageRefs.current[index] = el;
                  }}
                  className="images-wrapper"
                />
              </div>
            ))}
          </div>
        </Box>
      </Modal>
    </main>
  );
};

export default React.memo(DicomViewer);
