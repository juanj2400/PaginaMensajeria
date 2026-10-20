package com.serviciocorreo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync(proxyTargetClass = true)
@SpringBootApplication
public class ServicioCorreoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServicioCorreoApplication.class, args);
    }
}
