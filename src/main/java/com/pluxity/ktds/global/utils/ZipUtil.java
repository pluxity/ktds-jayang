package com.pluxity.ktds.global.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
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

        try (ZipInputStream zis = new ZipInputStream(inputStream, StandardCharsets.UTF_8)) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                if (!zipEntry.isDirectory()) {
                    String fileName = zipEntry.getName();
                    Path targetFilePath;
                    
                    // GLB 파일이고 UUID가 제공된 경우 파일명 변경
                    if (glbUuid != null && fileName.toLowerCase().endsWith(".glb")) {
                        String extension = getFileExtension(fileName);
                        String newFileName = glbUuid + "." + extension;
                        targetFilePath = targetDirectory.resolve(newFileName);
                    } else {
                        targetFilePath = targetDirectory.resolve(fileName);
                    }
                    
                    Files.createDirectories(targetFilePath.getParent());
                    Files.copy(zis, targetFilePath);
                    extractedFilePaths.add(targetFilePath);
                } else {
                    Files.createDirectories(targetDirectory.resolve(zipEntry.getName()));
                }
                zipEntry = zis.getNextEntry();
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
