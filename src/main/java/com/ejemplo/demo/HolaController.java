package com.ejemplo.demo;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HolaController {
    @GetMapping("/hola")
    public Map<String, String> hola() {
        return Map.of(
                "mensaje", "API desplegada en Azure correctamente",
                "estado", "OK");
    }
}