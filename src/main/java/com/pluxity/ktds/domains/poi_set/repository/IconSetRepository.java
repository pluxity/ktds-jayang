package com.pluxity.ktds.domains.poi_set.repository;

import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IconSetRepository extends JpaRepository<IconSet, Long> {

    Optional<IconSet> findByName(@NotNull String name);

    @EntityGraph(attributePaths = {"iconFile2D", "iconFile3D"})
    @Override
    List<IconSet> findAll();

    @EntityGraph(attributePaths = {"iconFile2D", "iconFile3D"})
    @Override
    Optional<IconSet> findById(@Param(value = "id") Long id);

    boolean existsByName(String name);
}
