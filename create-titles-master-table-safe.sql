-- BGHS Alumni Professional Titles Master Table - SAFE VERSION
-- This version handles existing data and prevents duplicate errors

-- Create titles master table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS professional_titles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert titles one by one to avoid conflicts
INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Dr.', 'Medical', 'Doctor of Medicine', 1, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Prof. Dr.', 'Medical', 'Professor Doctor', 2, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Dr. (Hons)', 'Medical', 'Doctor with Honors', 3, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Dr. (PhD)', 'Medical', 'Doctor of Philosophy in Medicine', 4, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Dr. (Dental)', 'Medical', 'Doctor of Dental Surgery', 5, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Dr. (Vet)', 'Medical', 'Doctor of Veterinary Medicine', 6, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Dr. (Ayurveda)', 'Medical', 'Doctor of Ayurvedic Medicine', 7, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Dr. (Homeopathy)', 'Medical', 'Doctor of Homeopathic Medicine', 8, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Prof.', 'Academic', 'Professor', 10, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Prof. (Emeritus)', 'Academic', 'Emeritus Professor', 11, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Assoc. Prof.', 'Academic', 'Associate Professor', 12, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Asst. Prof.', 'Academic', 'Assistant Professor', 13, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Dr. (Engg)', 'Academic', 'Doctor of Engineering', 15, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Dr. (Science)', 'Academic', 'Doctor of Science', 16, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Dr. (Literature)', 'Academic', 'Doctor of Literature', 17, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Principal', 'Academic', 'Principal/Head of Institution', 18, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Vice Principal', 'Academic', 'Vice Principal', 19, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Head of Dept.', 'Academic', 'Head of Department', 20, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Dean', 'Academic', 'Dean of Faculty', 21, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Registrar', 'Academic', 'Registrar', 22, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Adv.', 'Legal', 'Advocate', 30, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Sr. Adv.', 'Legal', 'Senior Advocate', 31, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Adv. (SC)', 'Legal', 'Advocate Supreme Court', 32, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Adv. (HC)', 'Legal', 'Advocate High Court', 33, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Judge', 'Legal', 'Judge', 34, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Chief Justice', 'Legal', 'Chief Justice', 35, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Justice', 'Legal', 'Justice', 36, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Legal Advisor', 'Legal', 'Legal Advisor', 37, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Notary', 'Legal', 'Notary Public', 38, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Eng.', 'Engineering', 'Engineer', 40, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Sr. Eng.', 'Engineering', 'Senior Engineer', 41, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Chief Eng.', 'Engineering', 'Chief Engineer', 42, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Tech. Lead', 'Engineering', 'Technical Lead', 43, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Architect', 'Engineering', 'Architect', 44, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Civil Eng.', 'Engineering', 'Civil Engineer', 45, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Mech. Eng.', 'Engineering', 'Mechanical Engineer', 46, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Elect. Eng.', 'Engineering', 'Electrical Engineer', 47, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Comp. Eng.', 'Engineering', 'Computer Engineer', 48, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('IT Specialist', 'Engineering', 'Information Technology Specialist', 49, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('CEO', 'Business', 'Chief Executive Officer', 50, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('CTO', 'Business', 'Chief Technology Officer', 51, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('CFO', 'Business', 'Chief Financial Officer', 52, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('COO', 'Business', 'Chief Operating Officer', 53, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Director', 'Business', 'Director', 54, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('MD', 'Business', 'Managing Director', 55, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('GM', 'Business', 'General Manager', 56, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('VP', 'Business', 'Vice President', 57, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('AVP', 'Business', 'Assistant Vice President', 58, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Manager', 'Business', 'Manager', 59, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Sr. Manager', 'Business', 'Senior Manager', 60, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Entrepreneur', 'Business', 'Entrepreneur', 61, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Consultant', 'Business', 'Consultant', 62, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Freelancer', 'Business', 'Freelancer', 63, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('IAS', 'Government', 'Indian Administrative Service', 70, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('IPS', 'Government', 'Indian Police Service', 71, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('IFS', 'Government', 'Indian Foreign Service', 72, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('IRS', 'Government', 'Indian Revenue Service', 73, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Collector', 'Government', 'District Collector', 74, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('SP', 'Government', 'Superintendent of Police', 75, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('DM', 'Government', 'District Magistrate', 76, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('SDM', 'Government', 'Sub Divisional Magistrate', 77, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('MLA', 'Government', 'Member of Legislative Assembly', 78, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('MP', 'Government', 'Member of Parliament', 79, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Minister', 'Government', 'Minister', 80, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Secretary', 'Government', 'Secretary', 81, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Joint Secretary', 'Government', 'Joint Secretary', 82, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Deputy Secretary', 'Government', 'Deputy Secretary', 83, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Gen.', 'Defense', 'General', 90, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Lt. Gen.', 'Defense', 'Lieutenant General', 91, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Maj. Gen.', 'Defense', 'Major General', 92, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Brig.', 'Defense', 'Brigadier', 93, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Col.', 'Defense', 'Colonel', 94, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Lt. Col.', 'Defense', 'Lieutenant Colonel', 95, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Maj.', 'Defense', 'Major', 96, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Capt.', 'Defense', 'Captain', 97, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Lt.', 'Defense', 'Lieutenant', 98, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Admiral', 'Defense', 'Admiral', 99, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Vice Admiral', 'Defense', 'Vice Admiral', 100, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Rear Admiral', 'Defense', 'Rear Admiral', 101, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Air Marshal', 'Defense', 'Air Marshal', 102, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Group Capt.', 'Defense', 'Group Captain', 103, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Wing Cdr.', 'Defense', 'Wing Commander', 104, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Squadron Ldr.', 'Defense', 'Squadron Leader', 105, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Journalist', 'Media', 'Journalist', 110, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Editor', 'Media', 'Editor', 111, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Correspondent', 'Media', 'Correspondent', 112, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Producer', 'Media', 'Producer', 113, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Director', 'Media', 'Director', 114, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Actor', 'Media', 'Actor', 115, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Singer', 'Media', 'Singer', 116, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Musician', 'Media', 'Musician', 117, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Artist', 'Media', 'Artist', 118, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Writer', 'Media', 'Writer', 119, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Poet', 'Media', 'Poet', 120, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Photographer', 'Media', 'Photographer', 121, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Player', 'Sports', 'Professional Player', 130, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Coach', 'Sports', 'Coach', 131, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Referee', 'Sports', 'Referee', 132, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Umpire', 'Sports', 'Umpire', 133, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Sports Administrator', 'Sports', 'Sports Administrator', 134, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Social Worker', 'Social', 'Social Worker', 140, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('NGO Founder', 'Social', 'NGO Founder', 141, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('NGO Director', 'Social', 'NGO Director', 142, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Volunteer', 'Social', 'Volunteer', 143, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Activist', 'Social', 'Social Activist', 144, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Swami', 'Religious', 'Swami', 150, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Maharaj', 'Religious', 'Maharaj', 151, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Pandit', 'Religious', 'Pandit', 152, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Imam', 'Religious', 'Imam', 153, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Pastor', 'Religious', 'Pastor', 154, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Priest', 'Religious', 'Priest', 155, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Retired', 'Other', 'Retired Professional', 160, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Homemaker', 'Other', 'Homemaker', 161, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Student', 'Other', 'Student', 162, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Researcher', 'Other', 'Researcher', 163, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Scientist', 'Other', 'Scientist', 164, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Analyst', 'Other', 'Analyst', 165, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Designer', 'Other', 'Designer', 166, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Developer', 'Other', 'Software Developer', 167, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Pilot', 'Other', 'Pilot', 168, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Captain', 'Other', 'Captain (Marine/Aviation)', 169, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Chef', 'Other', 'Chef', 170, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Pharmacist', 'Other', 'Pharmacist', 171, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Nurse', 'Other', 'Nurse', 172, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES
('Technician', 'Other', 'Technician', 173, TRUE)
ON CONFLICT (title) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Add title field to profiles table (if it doesn't exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_title_id INTEGER REFERENCES professional_titles(id);

-- Create index for better performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_professional_title ON profiles(professional_title_id);

-- Update existing profiles with titles based on current data (only if not already set)
UPDATE profiles 
SET professional_title_id = (
    SELECT id FROM professional_titles 
    WHERE title = 'Dr.' AND category = 'Medical'
)
WHERE professional_title_id IS NULL 
AND (profession ILIKE '%doctor%' OR profession ILIKE '%dr%' OR profession ILIKE '%medical%');

UPDATE profiles 
SET professional_title_id = (
    SELECT id FROM professional_titles 
    WHERE title = 'Prof.' AND category = 'Academic'
)
WHERE professional_title_id IS NULL 
AND (profession ILIKE '%professor%' OR profession ILIKE '%prof%');

UPDATE profiles 
SET professional_title_id = (
    SELECT id FROM professional_titles 
    WHERE title = 'Eng.' AND category = 'Engineering'
)
WHERE professional_title_id IS NULL 
AND (profession ILIKE '%engineer%' OR profession ILIKE '%eng%');

-- Add comment to the table
COMMENT ON TABLE professional_titles IS 'Master table for professional titles that alumni can display on their profiles';
COMMENT ON COLUMN profiles.professional_title_id IS 'Reference to professional title from master table';

-- Verify the setup
SELECT 
    'Professional Titles Table' as table_name,
    COUNT(*) as total_titles,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_titles
FROM professional_titles

UNION ALL

SELECT 
    'Profiles with Titles' as table_name,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN professional_title_id IS NOT NULL THEN 1 END) as profiles_with_titles
FROM profiles;
