package com.studreg;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;

@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
// @EnableSpringDataWebSupport:- It automatically enables several features related to handling pageable
//PageSerializationMode.VIA_DTO:-  necessary data show (page)
public class StudentRegFormApplication {

	public static void main(String[] args) {
		SpringApplication.run(StudentRegFormApplication.class, args);
	}

}
