package com.pathwise;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.nio.file.Files;
import java.nio.file.Paths;

@SpringBootTest
class DbMigrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void runMigration() throws Exception {
        String sql = new String(Files.readAllBytes(Paths.get("src/main/resources/db/migration/V3__add_embeddings.sql")));
        jdbcTemplate.execute(sql);
        System.out.println("Migration executed successfully");
    }
}
