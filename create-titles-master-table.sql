-- BGHS Alumni Professional Titles Master Table
-- This table contains all available professional titles that alumni can display

-- Create titles master table
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

-- Insert comprehensive list of professional titles
INSERT INTO professional_titles (title, category, description, display_order, is_active) VALUES

-- Medical & Healthcare
('Dr.', 'Medical', 'Doctor of Medicine', 1, TRUE),
('Prof. Dr.', 'Medical', 'Professor Doctor', 2, TRUE),
('Dr. (Hons)', 'Medical', 'Doctor with Honors', 3, TRUE),
('Dr. (PhD)', 'Medical', 'Doctor of Philosophy in Medicine', 4, TRUE),
('Dr. (Dental)', 'Medical', 'Doctor of Dental Surgery', 5, TRUE),
('Dr. (Vet)', 'Medical', 'Doctor of Veterinary Medicine', 6, TRUE),
('Dr. (Ayurveda)', 'Medical', 'Doctor of Ayurvedic Medicine', 7, TRUE),
('Dr. (Homeopathy)', 'Medical', 'Doctor of Homeopathic Medicine', 8, TRUE),

-- Academic & Education
('Prof.', 'Academic', 'Professor', 10, TRUE),
('Prof. (Emeritus)', 'Academic', 'Emeritus Professor', 11, TRUE),
('Assoc. Prof.', 'Academic', 'Associate Professor', 12, TRUE),
('Asst. Prof.', 'Academic', 'Assistant Professor', 13, TRUE),
('Dr.', 'Academic', 'Doctor of Philosophy', 14, TRUE),
('Dr. (Engg)', 'Academic', 'Doctor of Engineering', 15, TRUE),
('Dr. (Science)', 'Academic', 'Doctor of Science', 16, TRUE),
('Dr. (Literature)', 'Academic', 'Doctor of Literature', 17, TRUE),
('Principal', 'Academic', 'Principal/Head of Institution', 18, TRUE),
('Vice Principal', 'Academic', 'Vice Principal', 19, TRUE),
('Head of Dept.', 'Academic', 'Head of Department', 20, TRUE),
('Dean', 'Academic', 'Dean of Faculty', 21, TRUE),
('Registrar', 'Academic', 'Registrar', 22, TRUE),

-- Legal
('Adv.', 'Legal', 'Advocate', 30, TRUE),
('Sr. Adv.', 'Legal', 'Senior Advocate', 31, TRUE),
('Adv. (SC)', 'Legal', 'Advocate Supreme Court', 32, TRUE),
('Adv. (HC)', 'Legal', 'Advocate High Court', 33, TRUE),
('Judge', 'Legal', 'Judge', 34, TRUE),
('Chief Justice', 'Legal', 'Chief Justice', 35, TRUE),
('Justice', 'Legal', 'Justice', 36, TRUE),
('Legal Advisor', 'Legal', 'Legal Advisor', 37, TRUE),
('Notary', 'Legal', 'Notary Public', 38, TRUE),

-- Engineering & Technology
('Eng.', 'Engineering', 'Engineer', 40, TRUE),
('Sr. Eng.', 'Engineering', 'Senior Engineer', 41, TRUE),
('Chief Eng.', 'Engineering', 'Chief Engineer', 42, TRUE),
('Tech. Lead', 'Engineering', 'Technical Lead', 43, TRUE),
('Architect', 'Engineering', 'Architect', 44, TRUE),
('Civil Eng.', 'Engineering', 'Civil Engineer', 45, TRUE),
('Mech. Eng.', 'Engineering', 'Mechanical Engineer', 46, TRUE),
('Elect. Eng.', 'Engineering', 'Electrical Engineer', 47, TRUE),
('Comp. Eng.', 'Engineering', 'Computer Engineer', 48, TRUE),
('IT Specialist', 'Engineering', 'Information Technology Specialist', 49, TRUE),

-- Business & Corporate
('CEO', 'Business', 'Chief Executive Officer', 50, TRUE),
('CTO', 'Business', 'Chief Technology Officer', 51, TRUE),
('CFO', 'Business', 'Chief Financial Officer', 52, TRUE),
('COO', 'Business', 'Chief Operating Officer', 53, TRUE),
('Director', 'Business', 'Director', 54, TRUE),
('MD', 'Business', 'Managing Director', 55, TRUE),
('GM', 'Business', 'General Manager', 56, TRUE),
('VP', 'Business', 'Vice President', 57, TRUE),
('AVP', 'Business', 'Assistant Vice President', 58, TRUE),
('Manager', 'Business', 'Manager', 59, TRUE),
('Sr. Manager', 'Business', 'Senior Manager', 60, TRUE),
('Entrepreneur', 'Business', 'Entrepreneur', 61, TRUE),
('Consultant', 'Business', 'Consultant', 62, TRUE),
('Freelancer', 'Business', 'Freelancer', 63, TRUE),

-- Government & Public Service
('IAS', 'Government', 'Indian Administrative Service', 70, TRUE),
('IPS', 'Government', 'Indian Police Service', 71, TRUE),
('IFS', 'Government', 'Indian Foreign Service', 72, TRUE),
('IRS', 'Government', 'Indian Revenue Service', 73, TRUE),
('Collector', 'Government', 'District Collector', 74, TRUE),
('SP', 'Government', 'Superintendent of Police', 75, TRUE),
('DM', 'Government', 'District Magistrate', 76, TRUE),
('SDM', 'Government', 'Sub Divisional Magistrate', 77, TRUE),
('MLA', 'Government', 'Member of Legislative Assembly', 78, TRUE),
('MP', 'Government', 'Member of Parliament', 79, TRUE),
('Minister', 'Government', 'Minister', 80, TRUE),
('Secretary', 'Government', 'Secretary', 81, TRUE),
('Joint Secretary', 'Government', 'Joint Secretary', 82, TRUE),
('Deputy Secretary', 'Government', 'Deputy Secretary', 83, TRUE),

-- Armed Forces & Defense
('Gen.', 'Defense', 'General', 90, TRUE),
('Lt. Gen.', 'Defense', 'Lieutenant General', 91, TRUE),
('Maj. Gen.', 'Defense', 'Major General', 92, TRUE),
('Brig.', 'Defense', 'Brigadier', 93, TRUE),
('Col.', 'Defense', 'Colonel', 94, TRUE),
('Lt. Col.', 'Defense', 'Lieutenant Colonel', 95, TRUE),
('Maj.', 'Defense', 'Major', 96, TRUE),
('Capt.', 'Defense', 'Captain', 97, TRUE),
('Lt.', 'Defense', 'Lieutenant', 98, TRUE),
('Admiral', 'Defense', 'Admiral', 99, TRUE),
('Vice Admiral', 'Defense', 'Vice Admiral', 100, TRUE),
('Rear Admiral', 'Defense', 'Rear Admiral', 101, TRUE),
('Air Marshal', 'Defense', 'Air Marshal', 102, TRUE),
('Group Capt.', 'Defense', 'Group Captain', 103, TRUE),
('Wing Cdr.', 'Defense', 'Wing Commander', 104, TRUE),
('Squadron Ldr.', 'Defense', 'Squadron Leader', 105, TRUE),

-- Media & Arts
('Journalist', 'Media', 'Journalist', 110, TRUE),
('Editor', 'Media', 'Editor', 111, TRUE),
('Correspondent', 'Media', 'Correspondent', 112, TRUE),
('Producer', 'Media', 'Producer', 113, TRUE),
('Director', 'Media', 'Director', 114, TRUE),
('Actor', 'Media', 'Actor', 115, TRUE),
('Singer', 'Media', 'Singer', 116, TRUE),
('Musician', 'Media', 'Musician', 117, TRUE),
('Artist', 'Media', 'Artist', 118, TRUE),
('Writer', 'Media', 'Writer', 119, TRUE),
('Poet', 'Media', 'Poet', 120, TRUE),
('Photographer', 'Media', 'Photographer', 121, TRUE),

-- Sports & Athletics
('Player', 'Sports', 'Professional Player', 130, TRUE),
('Coach', 'Sports', 'Coach', 131, TRUE),
('Referee', 'Sports', 'Referee', 132, TRUE),
('Umpire', 'Sports', 'Umpire', 133, TRUE),
('Sports Administrator', 'Sports', 'Sports Administrator', 134, TRUE),

-- Social & NGO
('Social Worker', 'Social', 'Social Worker', 140, TRUE),
('NGO Founder', 'Social', 'NGO Founder', 141, TRUE),
('NGO Director', 'Social', 'NGO Director', 142, TRUE),
('Volunteer', 'Social', 'Volunteer', 143, TRUE),
('Activist', 'Social', 'Social Activist', 144, TRUE),

-- Religious & Spiritual
('Swami', 'Religious', 'Swami', 150, TRUE),
('Maharaj', 'Religious', 'Maharaj', 151, TRUE),
('Pandit', 'Religious', 'Pandit', 152, TRUE),
('Imam', 'Religious', 'Imam', 153, TRUE),
('Pastor', 'Religious', 'Pastor', 154, TRUE),
('Priest', 'Religious', 'Priest', 155, TRUE),

-- Other Professions
('Retired', 'Other', 'Retired Professional', 160, TRUE),
('Homemaker', 'Other', 'Homemaker', 161, TRUE),
('Student', 'Other', 'Student', 162, TRUE),
('Researcher', 'Other', 'Researcher', 163, TRUE),
('Scientist', 'Other', 'Scientist', 164, TRUE),
('Analyst', 'Other', 'Analyst', 165, TRUE),
('Designer', 'Other', 'Designer', 166, TRUE),
('Developer', 'Other', 'Software Developer', 167, TRUE),
('Pilot', 'Other', 'Pilot', 168, TRUE),
('Captain', 'Other', 'Captain (Marine/Aviation)', 169, TRUE),
('Chef', 'Other', 'Chef', 170, TRUE),
('Pharmacist', 'Other', 'Pharmacist', 171, TRUE),
('Nurse', 'Other', 'Nurse', 172, TRUE),
('Technician', 'Other', 'Technician', 173, TRUE);

-- Add title field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_title_id INTEGER REFERENCES professional_titles(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_professional_title ON profiles(professional_title_id);

-- Update existing profiles with titles based on current data
UPDATE profiles 
SET professional_title_id = (
    SELECT id FROM professional_titles 
    WHERE title = 'Dr.' AND category = 'Medical'
)
WHERE profession ILIKE '%doctor%' OR profession ILIKE '%dr%' OR profession ILIKE '%medical%';

UPDATE profiles 
SET professional_title_id = (
    SELECT id FROM professional_titles 
    WHERE title = 'Prof.' AND category = 'Academic'
)
WHERE profession ILIKE '%professor%' OR profession ILIKE '%prof%';

UPDATE profiles 
SET professional_title_id = (
    SELECT id FROM professional_titles 
    WHERE title = 'Eng.' AND category = 'Engineering'
)
WHERE profession ILIKE '%engineer%' OR profession ILIKE '%eng%';

-- Add comment to the table
COMMENT ON TABLE professional_titles IS 'Master table for professional titles that alumni can display on their profiles';
COMMENT ON COLUMN profiles.professional_title_id IS 'Reference to professional title from master table';
