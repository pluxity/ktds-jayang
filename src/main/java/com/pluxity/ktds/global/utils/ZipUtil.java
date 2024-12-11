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

    public static void extractFiles(InputStream inputStream, Path targetDirectory) throws IOException, IllegalArgumentException {
        List<Path> extractedFilePaths = new ArrayList<>();

//        try (ZipInputStream zis = new ZipInputStream(inputStream, Charset.forName("euc-kr"))) {
//        try (ZipInputStream zis = new ZipInputStream(inputStream, Charset.defaultCharset())) {

        try (ZipInputStream zis = new ZipInputStream(inputStream, StandardCharsets.UTF_8)) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                Path targetFilePath = targetDirectory.resolve(zipEntry.getName());
                if (!zipEntry.isDirectory()) {
                    Files.createDirectories(targetFilePath.getParent());
                    Files.copy(zis, targetFilePath);
                    extractedFilePaths.add(targetFilePath);
                } else {
                    Files.createDirectories(targetFilePath);
                }
                zipEntry = zis.getNextEntry();
            }
        }
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
