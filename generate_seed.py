import json
import uuid

skills = [
    ('html', 'HTML', 'Frontend'),
    ('css', 'CSS', 'Frontend'),
    ('js', 'JavaScript', 'Frontend'),
    ('react', 'React', 'Frontend'),
    ('python', 'Python', 'Data Analyst'),
    ('sql', 'SQL', 'Data Analyst'),
    ('pandas', 'Pandas', 'Data Analyst'),
    ('ml_basics', 'Machine Learning Basics', 'ML Engineer'),
    ('scikit', 'Scikit-Learn', 'ML Engineer'),
    ('deep_learning', 'Deep Learning', 'ML Engineer'),
    ('product_strategy', 'Product Strategy', 'Product Manager'),
    ('agile', 'Agile Methodologies', 'Product Manager'),
    ('seo', 'SEO', 'Digital Marketer'),
    ('content_marketing', 'Content Marketing', 'Digital Marketer')
]

catalog = []
# generate 60 items
import random
random.seed(42)

for i in range(15):
    # Frontend
    c_id = str(uuid.uuid4())
    catalog.append((c_id, f"Frontend Course {i}", "Learn frontend concepts", "course", 10.0, "Provider A", "beginner", "http://example.com"))
    
for i in range(15):
    # Data Analyst
    c_id = str(uuid.uuid4())
    catalog.append((c_id, f"Data Analyst Project {i}", "Analyze data", "project", 5.0, "Provider B", "intermediate", "http://example.com"))

for i in range(15):
    # ML Engineer
    c_id = str(uuid.uuid4())
    catalog.append((c_id, f"ML Article {i}", "Read about ML", "article", 1.0, "Provider C", "advanced", "http://example.com"))

for i in range(15):
    # Product Manager
    c_id = str(uuid.uuid4())
    catalog.append((c_id, f"PM Course {i}", "Product management", "course", 8.0, "Provider D", "beginner", "http://example.com"))

sql = "INSERT INTO skills (id, name, domain) VALUES\n"
sql += ",\n".join([f"('{s[0]}', '{s[1]}', '{s[2]}')" for s in skills]) + ";\n\n"

sql += "INSERT INTO catalog_items (id, title, description, format, estimated_hours, provider, difficulty, url) VALUES\n"
sql += ",\n".join([f"('{c[0]}', '{c[1]}', '{c[2]}', '{c[3]}', {c[4]}, '{c[5]}', '{c[6]}', '{c[7]}')" for c in catalog]) + ";\n\n"

sql += "INSERT INTO catalog_item_skills (catalog_item_id, skill_id, is_prerequisite, is_outcome) VALUES\n"
cis = []
for i, c in enumerate(catalog):
    if i < 15:
        cis.append(f"('{c[0]}', 'html', false, true)")
        if i > 5:
            cis.append(f"('{c[0]}', 'html', true, false)")
            cis.append(f"('{c[0]}', 'css', false, true)")
    elif i < 30:
        cis.append(f"('{c[0]}', 'python', false, true)")
        if i > 20:
            cis.append(f"('{c[0]}', 'python', true, false)")
            cis.append(f"('{c[0]}', 'pandas', false, true)")
    elif i < 45:
        cis.append(f"('{c[0]}', 'ml_basics', false, true)")
    else:
        cis.append(f"('{c[0]}', 'product_strategy', false, true)")

sql += ",\n".join(cis) + ";\n"

with open('backend/src/main/resources/db/migration/V2__seed_data.sql', 'w') as f:
    f.write(sql)
