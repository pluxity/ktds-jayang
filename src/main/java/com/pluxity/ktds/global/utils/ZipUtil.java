package com.pluxity.ktds.global.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.charset.MalformedInputException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Slf4j
public class ZipUtil {

    private ZipUtil() {
    }

    public static void extractFiles(InputStream inputStream, Path targetDirectory, String glbUuid) throws IOException, IllegalArgumentException {
        List<Path> extractedFilePaths = new ArrayList<>();
        byte[] zipData = inputStream.readAllBytes();

        Charset[] charSetList = new Charset[] {
                Charset.forName("Cp949"),
                StandardCharsets.UTF_8
        };

        for (Charset charset : charSetList) {
            try (ByteArrayInputStream bais = new ByteArrayInputStream(zipData);
                 ZipInputStream zis = (charset != null) ? new ZipInputStream(bais, charset) : new ZipInputStream(bais)) {

                ZipEntry zipEntry;
                while ((zipEntry = zis.getNextEntry()) != null) {
                    if (zipEntry.isDirectory()) {
                        Files.createDirectories(targetDirectory.resolve(zipEntry.getName()));
                    } else {
                        String fileName = zipEntry.getName();
                        Path targetFilePath;

                        if (glbUuid != null && fileName.toLowerCase().endsWith(".glb")) {
                            String extension = getFileExtension(fileName);
                            String newFileName = glbUuid + "." + extension;
                            targetFilePath = targetDirectory.resolve(newFileName);
                        } else {
                            targetFilePath = targetDirectory.resolve(fileName);
                        }

                        Files.createDirectories(targetFilePath.getParent());
                        try (OutputStream os = Files.newOutputStream(targetFilePath)) {
                            zis.transferTo(os);
                        }
                        extractedFilePaths.add(targetFilePath);
                    }
                    zis.closeEntry();
                }
                return;
            }
        }
    }


    /**
     * 파일명에서 확장자를 추출하는 헬퍼 메서드
     */
    private static String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < fileName.length() - 1) {
            return fileName.substring(lastDotIndex + 1);
        }
        return "";
    }

    public static void zip(MultipartFile file, Path bp) {
        try (FileOutputStream outputStream = new FileOutputStream(bp.toFile())) {
            ZipOutputStream zipOutputStream = new ZipOutputStream(outputStream);
            ZipEntry zipEntry = new ZipEntry(Objects.requireNonNull(file.getOriginalFilename()));
            zipOutputStream.putNextEntry(zipEntry);
            zipOutputStream.write(file.getBytes());
            zipOutputStream.close();
        } catch (Exception e) {
            log.error(ErrorCode.FAILED_TO_ZIP_FILE.getMessage());
            throw new CustomException(ErrorCode.FAILED_TO_ZIP_FILE);
        }
    }

    public static boolean containsXmlFile(MultipartFile file) {
        try (ZipInputStream zis = new ZipInputStream(file.getInputStream(), StandardCharsets.UTF_8)) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                if (zipEntry.getName().endsWith(".xml")) {
                    return true;
                }
                zipEntry = zis.getNextEntry();
            }
        } catch (IOException e) {
            log.error(ErrorCode.NOT_FOUND_XML_FILE.getMessage());
            throw new CustomException(ErrorCode.NOT_FOUND_XML_FILE);
        }
        return false;
    }
}
