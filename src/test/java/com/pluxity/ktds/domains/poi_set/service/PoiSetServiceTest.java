package com.pluxity.ktds.domains.poi_set.service;

import com.pluxity.ktds.domains.poi_set.dto.PoiSetRequestDto;
import com.pluxity.ktds.domains.poi_set.dto.PoiSetResponseDto;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.entity.PoiSet;
import com.pluxity.ktds.domains.poi_set.repository.PoiCategoryRepository;
import com.pluxity.ktds.domains.poi_set.repository.PoiSetRepository;
import com.pluxity.ktds.global.exception.CustomException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class PoiSetServiceTest {

    @Autowired
    PoiSetService service;

    @Autowired
    PoiSetRepository repository;

    @Autowired
    PoiCategoryRepository poiCategoryRepository;

    private PoiCategory poiCategory01;
    private PoiCategory poiCategory02;

    private PoiCategory savePoiCategory(final String name) {
        return poiCategoryRepository.save(PoiCategory.builder().name(name).build());
    }

    @BeforeEach
    void savePoiCategories() {
        poiCategory01 = savePoiCategory("카테고리01");
        poiCategory02 = savePoiCategory("카테고리02");
    }

    private PoiSet save(final String name) {

        PoiSetRequestDto requestDto = new PoiSetRequestDto(name, List.of(poiCategory01.getId(), poiCategory02.getId()));
        Long id = service.save(requestDto);

        repository.flush();

        return repository.findById(id).orElseThrow();
    }

    @Test
    void 저장() {

        final String poiCategoryName = "POI_SET_01";
        PoiSetRequestDto requestDto = new PoiSetRequestDto(poiCategoryName, List.of(poiCategory01.getId(), poiCategory02.getId()));
        Long id = service.save(requestDto);

        repository.flush();

        PoiSet fetchEntity = repository.findById(id).orElseThrow();

        assertThat(fetchEntity.getName()).isEqualTo("POI_SET_01");
    }

    @Test
    void 저장_예외() {

        final String poiCategoryName = "POI_SET_01";
        PoiSetRequestDto requestDto = new PoiSetRequestDto(poiCategoryName, List.of(poiCategory01.getId(), poiCategory02.getId()));

        service.save(requestDto);

        repository.flush();

        CustomException exception = assertThrows(CustomException.class, () -> {
            final String duplicateName = "POI_SET_01";
            PoiSetRequestDto duplicateDto = new PoiSetRequestDto(duplicateName, null);
            service.save(duplicateDto);
        });

        assertThat(exception.getErrorCode().getMessage()).isEqualTo("이미 존재하는 이름 입니다.");
    }

    @Test
    void 검색_ID() {

        final String poiSetName = "POI_SET_01";
        PoiSet entity = save(poiSetName);

        PoiSetResponseDto dto = service.findById(entity.getId());

        assertThat(dto.name()).isEqualTo("POI_SET_01");
    }

    @Test
    void 검색_전체() {

        save("POI_SET_01");
        save("POI_SET_02");
        save("POI_SET_03");

        repository.flush();

        List<PoiSetResponseDto> dtoList = service.findAll();

        assertThat(dtoList.get(0).name()).isEqualTo("POI_SET_01");
        assertThat(dtoList.get(1).name()).isEqualTo("POI_SET_02");
        assertThat(dtoList.get(2).name()).isEqualTo("POI_SET_03");
    }


    @Test
    void 삭제() {
        PoiSet entity = this.save("POI_SET_01");

        repository.flush();

        Long id = entity.getId();

        service.delete(id);
        Exception exception = assertThrows(NoSuchElementException.class, () -> repository.findById(id).orElseThrow());

        final String expect = "No value present";

        assertTrue(exception.getMessage().contains(expect));
    }

    @Test
    void 수정_이름() {
        PoiSet entity = this.save("POI_SET_01");

        repository.flush();

        Long id = entity.getId();

        PoiSetRequestDto dto = PoiSetRequestDto.builder()
                .name("수정된 POI_SET 이름")
                .build();

        service.update(id, dto);

        repository.flush();
        PoiSet fetchEntity = repository.findById(id).orElseThrow();

        assertThat(fetchEntity.getName()).isEqualTo("수정된 POI_SET 이름");
    }

    @Test
    void 수정_관계() {
        PoiSet entity = this.save("POI_SET_01");

        repository.flush();

        Long id = entity.getId();

        PoiSetRequestDto dto = PoiSetRequestDto.builder()
                .poiCategoryIds(List.of(poiCategory01.getId()))
                .build();

        service.update(id, dto);

        repository.flush();

        PoiSet fetchEntity = repository.findById(id).orElseThrow();

        assertThat(fetchEntity.getPoiCategories().size()).isEqualTo(1);
        assertThat(fetchEntity.getPoiCategories().get(0)).isEqualTo(poiCategory01);
    }

}