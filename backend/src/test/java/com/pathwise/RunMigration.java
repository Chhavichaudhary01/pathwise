package com.pathwise;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class RunMigration {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/pathwise", "postgres", "chhavi_newPass@#01");
            Statement stmt = conn.createStatement();
            
            stmt.execute("UPDATE flyway_schema_history SET checksum = 1071155394 WHERE version = '3';");
            System.out.println("Repaired flyway checksum!");
            
            String sql = new String(Files.readAllBytes(Paths.get("src/main/resources/db/migration/V3__add_embeddings.sql")));
            stmt.execute(sql);
            System.out.println("Migration applied!");
            
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
