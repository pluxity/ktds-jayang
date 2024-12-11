package com.pluxity.ktds.global.utils;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Objects;
import java.util.Optional;


public class FileUtil {

    private FileUtil() {
    }

    private static final Logger LOGGER = LoggerFactory.getLogger(FileUtil.class);

    public static void checkExcel(Path path) throws IOException {
        String ext = getExtension(path);
        if (!(ext.equals("xls") || ext.equals("xlsx"))) {
            Files.delete(path);
            LOGGER.error(ErrorCode.INVALID_EXCEL_FILE.getMessage());
            throw new CustomException(ErrorCode.INVALID_EXCEL_FILE);
        }
    }

    public static void checkImage(Path path) {
        try {

            InputStream inputStream = Files.newInputStream(path);
            ImageInputStream imageInputStream = ImageIO.createImageInputStream(inputStream);
            Iterator<ImageReader> imageReaders = ImageIO.getImageReaders(imageInputStream);

            if (!imageReaders.hasNext()) {
                Files.delete(path);
                LOGGER.error(ErrorCode.INVALID_IMAGE_FILE.getMessage());
                throw new CustomException(ErrorCode.INVALID_IMAGE_FILE);
            }

        } catch (IOException e) {
            LOGGER.error(ErrorCode.INVALID_IMAGE_FILE.getMessage());
            throw new CustomException(ErrorCode.INVALID_IMAGE_FILE);
        }
    }

    public static void checkImage(InputStream inputStream) {
        try (ImageInputStream imageInputStream = ImageIO.createImageInputStream(inputStream)) {
            Iterator<ImageReader> imageReaders = ImageIO.getImageReaders(imageInputStream);

            if (!imageReaders.hasNext()) {
                LOGGER.error(ErrorCode.INVALID_IMAGE_FILE.getMessage());
                throw new CustomException(ErrorCode.INVALID_IMAGE_FILE);
            }

        } catch (IOException e) {
            LOGGER.error(ErrorCode.INVALID_IMAGE_FILE.getMessage());
            throw new CustomException(ErrorCode.INVALID_IMAGE_FILE);
        }
    }

    public static void checkExtractable(MultipartFile file) {
        String filename = Objects.requireNonNull(file.getOriginalFilename()).toLowerCase();
        if (!filename.endsWith(".fbx") && !filename.endsWith(".gltf") && !filename.endsWith(".glb")) {
            throw new CustomException(ErrorCode.INVALID_FILE);
        }

    }

    public static String getExtension(Path path) {
        return getExtension(path.toString());
    }

    public static String getExtension(String fileName) {
        return Optional.of(fileName)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(fileName.lastIndexOf(".") + 1))
                .orElseThrow();
    }

}

