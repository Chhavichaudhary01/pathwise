package com.pathwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class PathwiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(PathwiseApplication.class, args);
    }

}
