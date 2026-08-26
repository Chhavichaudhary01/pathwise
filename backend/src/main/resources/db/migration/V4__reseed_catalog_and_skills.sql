-- Re-seed skills if missing
INSERT INTO skills (id, name, domain) VALUES
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
ON CONFLICT (id) DO NOTHING;

-- Re-seed catalog items if missing
INSERT INTO catalog_items (id, title, description, format, estimated_hours, provider, difficulty, url) VALUES
('f388587f-0749-4ff6-aedf-f947115355b4', 'Frontend Course 0: HTML & Web Standards', 'Learn HTML semantics, forms, and accessibility standards', 'course', 6.0, 'MDN / FreeCodeCamp', 'beginner', 'https://developer.mozilla.org'),
('2a0f8edc-b0e7-4282-808c-0377f0869adf', 'Frontend Project 1: Responsive Portfolio', 'Build a fully responsive modern web portfolio from scratch', 'project', 8.0, 'Frontend Mentor', 'beginner', 'https://frontendmentor.io'),
('c86b8ace-46b7-4a5d-b207-ffcec22f2860', 'Frontend Course 2: Modern JavaScript ES6+', 'Async/await, closures, promises, event loop, and modular architecture', 'course', 12.0, 'JavaScript.info', 'intermediate', 'https://javascript.info'),
('46b10f52-860c-41b4-af30-d0421bd3fe36', 'Frontend Course 3: React Fundamentals & Hooks', 'Component lifecycle, useState, useEffect, custom hooks, and context', 'course', 14.0, 'React Docs', 'intermediate', 'https://react.dev'),
('e020bb3d-9dca-4180-9633-d37075db5731', 'Frontend Project 4: Full Stack React Application', 'Build an interactive web application with Zustand and REST APIs', 'project', 16.0, 'FullStackOpen', 'advanced', 'https://fullstackopen.com'),
('5bf0b6eb-0e14-4faf-8700-7b1a96d0ba2f', 'Data Project 0: SQL Analytics & Business Intelligence', 'Querying multi-table relational databases and writing complex window functions', 'project', 6.0, 'Mode Analytics', 'beginner', 'https://mode.com/sql-tutorial/'),
('d228fe8d-5fa2-4c2c-a26f-4fc11428e494', 'Data Course 1: Python for Data Science & Pandas', 'Data structures, vectorized transformations, and exploratory data analysis', 'course', 10.0, 'Kaggle', 'beginner', 'https://kaggle.com/learn/pandas'),
('4d6cb1cb-4b1b-4e24-9818-1a2b929c6adb', 'Data Project 2: Tableau & PowerBI Dashboards', 'Designing executive metrics and automated stakeholder reporting pipelines', 'project', 12.0, 'Coursera', 'intermediate', 'https://coursera.org'),
('9e36c017-72fb-4e46-8996-b480fe31a977', 'ML Course 0: Applied Machine Learning & Scikit-Learn', 'Regression, classification, cross-validation, and hyperparameter tuning', 'course', 14.0, 'Scikit-Learn Academy', 'intermediate', 'https://scikit-learn.org'),
('5c1b6d68-897e-478b-93e4-c6544944dd89', 'ML Project 1: PyTorch Deep Learning & Neural Networks', 'Building CNNs and Transformers for computer vision and NLP', 'project', 18.0, 'Fast.ai', 'advanced', 'https://course.fast.ai')
ON CONFLICT (id) DO NOTHING;

-- Map item skills
INSERT INTO catalog_item_skills (catalog_item_id, skill_id, is_outcome, is_prerequisite) VALUES
('f388587f-0749-4ff6-aedf-f947115355b4', 'html', true, false),
('2a0f8edc-b0e7-4282-808c-0377f0869adf', 'css', true, false),
('2a0f8edc-b0e7-4282-808c-0377f0869adf', 'html', false, true),
('c86b8ace-46b7-4a5d-b207-ffcec22f2860', 'js', true, false),
('c86b8ace-46b7-4a5d-b207-ffcec22f2860', 'html', false, true),
('46b10f52-860c-41b4-af30-d0421bd3fe36', 'react', true, false),
('46b10f52-860c-41b4-af30-d0421bd3fe36', 'js', false, true),
('e020bb3d-9dca-4180-9633-d37075db5731', 'react', true, false),
('e020bb3d-9dca-4180-9633-d37075db5731', 'js', false, true),
('5bf0b6eb-0e14-4faf-8700-7b1a96d0ba2f', 'sql', true, false),
('d228fe8d-5fa2-4c2c-a26f-4fc11428e494', 'python', true, false),
('d228fe8d-5fa2-4c2c-a26f-4fc11428e494', 'pandas', true, false),
('4d6cb1cb-4b1b-4e24-9818-1a2b929c6adb', 'sql', false, true),
('9e36c017-72fb-4e46-8996-b480fe31a977', 'ml_basics', true, false),
('9e36c017-72fb-4e46-8996-b480fe31a977', 'scikit', true, false),
('9e36c017-72fb-4e46-8996-b480fe31a977', 'python', false, true),
('5c1b6d68-897e-478b-93e4-c6544944dd89', 'deep_learning', true, false),
('5c1b6d68-897e-478b-93e4-c6544944dd89', 'scikit', false, true)
ON CONFLICT (catalog_item_id, skill_id, is_prerequisite) DO NOTHING;
