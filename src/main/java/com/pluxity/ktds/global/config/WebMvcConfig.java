package com.pluxity.ktds.global.config;

import com.pluxity.ktds.global.constant.ViewPath;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.resource.PathResourceResolver;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${root-path.upload}")
    private String resourcePath;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("*")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(20)
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
        registry.addResourceHandler("/**")
                .addResourceLocations("file:" + resourcePath)
                .setCachePeriod(9600)
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
        registry.addResourceHandler("/favicon.ico")
                .addResourceLocations("classpath:/static/favicon.ico");

    }

    @Override
    public void addViewControllers(@NotNull ViewControllerRegistry registry) {
        for(ViewPath v : ViewPath.values()) {
            registry.addViewController(v.getPath()).setViewName(v.getView());
        }
    }

}
