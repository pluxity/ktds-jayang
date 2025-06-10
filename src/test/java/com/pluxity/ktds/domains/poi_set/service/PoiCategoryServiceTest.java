package com.pluxity.ktds.domains.poi_set.service;

import com.pluxity.ktds.domains.poi_set.dto.IconSetFileRequestDto;
import com.pluxity.ktds.domains.poi_set.dto.IconSetRequestDto;
import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryRequestDto;
import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryResponseDto;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.repository.IconSetRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
import com.pluxity.ktds.domains.plx_file.starategy.SaveZipFile;
import com.pluxity.ktds.global.exception.CustomException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.NoSuchElementException;

import static com.pluxity.ktds.domains.plx_file.constant.FileEntityType.ICON2D;
import static com.pluxity.ktds.domains.plx_file.constant.FileEntityType.ICON3D;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class PoiCategoryServiceTest {

    @Autowired
    PoiCategoryService service;

    @Autowired
    PoiCategoryRepository repository;

    @Autowired
    IconSetService iconSetService;

    @Autowired
    IconSetRepository iconSetRepository;

    @Autowired
    SaveImage imageStrategy;

    @Autowired
    SaveZipFile zipStrategy;

    public IconSet iconSet01;
    public IconSet iconSet02;

    private Long save2DFile() throws IOException {
        Path path = Paths.get("src", "test", "resources", "2dIcon.png");
        byte[] fileContent = Files.readAllBytes(path);
        MultipartFile multipartFile = new MockMultipartFile("file", path.getFileName().toString(), "image/png", fileContent);

        IconSetFileRequestDto dto = IconSetFileRequestDto.builder()
                .type(ICON2D)
                .strategy(imageStrategy)
                .file(multipartFile)
                .build();

        return iconSetService.saveIconFile(dto).id();
    }

    private Long save3DFile() throws IOException {
        Path path = Paths.get("src", "test", "resources", "3dIcon.zip");
        byte[] fileContent = Files.readAllBytes(path);
        MultipartFile multipartFile = new MockMultipartFile("file", path.getFileName().toString(), "application/zip", fileContent);

        IconSetFileRequestDto dto = IconSetFileRequestDto.builder()
                .type(ICON3D)
                .strategy(zipStrategy)
                .file(multipartFile)
                .build();

        return iconSetService.saveIconFile(dto).id();
    }

    IconSet saveIconSet(final String name) throws IOException {
        Long fileInfoId2D = save2DFile();
        Long fileInfoId3D = save3DFile();

        IconSetRequestDto requestDto = new IconSetRequestDto(name, fileInfoId2D, fileInfoId3D);
        Long id = iconSetService.save(requestDto);

        return iconSetRepository.findById(id).orElseThrow();
    }

    @BeforeEach
    void saveIconSets() throws IOException {
        iconSet01 = saveIconSet("아이콘셋_01");
        iconSet02 = saveIconSet("아이콘셋_02");
    }

    private Long saveImageFile(String fileName) throws IOException {
        Path path = Paths.get("src", "test", "resources", fileName);
        byte[] fileContent = Files.readAllBytes(path);
        MultipartFile multipartFile = new MockMultipartFile("file", path.getFileName().toString(), "image/png", fileContent);

        return service.saveImageFile(multipartFile).id();
    }

    private PoiCategory save(final String name) throws IOException {

        Long imageFileId = saveImageFile("category_icon_bus.png");

        PoiCategoryRequestDto requestDto = new PoiCategoryRequestDto(name, imageFileId, List.of(iconSet01.getId(), iconSet02.getId()));
        Long id = service.save(requestDto);

        repository.flush();

        return repository.findById(id).orElseThrow();
    }

    @Test
    void 저장() throws IOException {

        Long imageFileId = saveImageFile("category_icon_bus.png");

        saveImageFile("category_icon_escape.png");

        final String poiCategoryName = "버스카테고리";
        PoiCategoryRequestDto requestDto = new PoiCategoryRequestDto(poiCategoryName, imageFileId, List.of(iconSet01.getId(), iconSet02.getId()));
        Long id = service.save(requestDto);

        repository.flush();

        PoiCategory fetchEntity = repository.findById(id).orElseThrow();

        assertThat(fetchEntity.getName()).isEqualTo("버스카테고리");
    }

    @Test
    void 저장_예외() throws IOException {

        Long imageFileId = saveImageFile("category_icon_bus.png");
        Long imageFileId2 = saveImageFile("category_icon_escape.png");

        final String poiCategoryName = "버스카테고리";
        PoiCategoryRequestDto requestDto = new PoiCategoryRequestDto(poiCategoryName, imageFileId, List.of(iconSet01.getId(), iconSet02.getId()));

        service.save(requestDto);

        repository.flush();

        CustomException exception = assertThrows(CustomException.class, () -> {
            final String duplicateName = "버스카테고리";
            PoiCategoryRequestDto duplicateDto = new PoiCategoryRequestDto(duplicateName, imageFileId2, null);
            service.save(duplicateDto);
        });

        assertThat(exception.getErrorCode().getMessage()).isEqualTo("이미 존재하는 이름 입니다.");
    }

    @Test
    void 검색_ID() throws IOException {

        final String categoryName = "버스카테고리";
        PoiCategory entity = save(categoryName);

        PoiCategoryResponseDto dto = service.findById(entity.getId());

        assertThat(dto.name()).isEqualTo("버스카테고리");
    }

    @Test
    void 검색_전체() throws IOException {

        save("버스카테고리01");
        save("버스카테고리02");
        save("버스카테고리03");

        repository.flush();

        List<PoiCategoryResponseDto> dtoList = service.findAll();

        assertThat(dtoList.get(0).name()).isEqualTo("버스카테고리01");
        assertThat(dtoList.get(1).name()).isEqualTo("버스카테고리02");
        assertThat(dtoList.get(2).name()).isEqualTo("버스카테고리03");
    }


    @Test
    void 삭제() throws IOException {
        PoiCategory entity = this.save("버스카테고리");

        repository.flush();

        Long id = entity.getId();

        service.delete(id);
        Exception exception = assertThrows(NoSuchElementException.class, () -> repository.findById(id).orElseThrow());

        final String expect = "No value present";

        assertTrue(exception.getMessage().contains(expect));
    }

    @Test
    void 수정_이름() throws IOException {
        PoiCategory entity = this.save("버스카테고리");

        repository.flush();

        Long id = entity.getId();

        PoiCategoryRequestDto dto = PoiCategoryRequestDto.builder()
                .name("수정된 카테고리 이름")
                .build();

        service.update(id, dto);

        repository.flush();
        PoiCategory fetchEntity = repository.findById(id).orElseThrow();

        assertThat(fetchEntity.getName()).isEqualTo("수정된 카테고리 이름");
    }

    @Test
    void 수정_관계() throws IOException {
        PoiCategory entity = this.save("버스카테고리");

        repository.flush();

        Long id = entity.getId();

        PoiCategoryRequestDto dto = PoiCategoryRequestDto.builder()
                .iconSetIds(List.of(iconSet01.getId()))
                .build();

        service.update(id, dto);

        repository.flush();

        PoiCategory fetchEntity = repository.findById(id).orElseThrow();

        assertThat(fetchEntity.getIconSets().size()).isEqualTo(1);
        assertThat(fetchEntity.getIconSets().get(0)).isEqualTo(iconSet01);
    }
}