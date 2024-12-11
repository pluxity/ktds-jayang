package com.pluxity.ktds;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class KtDsApplication {

    public static void main(String[] args) {
        SpringApplication.run(KtDsApplication.class, args);
    }

}
