-- Check if professional title is saved for the user
SELECT 
    p.id,
    p.full_name,
    p.profession,
    p.professional_title_id,
    pt.title as professional_title,
    pt.category as professional_title_category
FROM profiles p
LEFT JOIN professional_titles pt ON p.professional_title_id = pt.id
WHERE p.full_name ILIKE '%Dibyendu%' OR p.full_name ILIKE '%Chandra%'
ORDER BY p.created_at DESC;
