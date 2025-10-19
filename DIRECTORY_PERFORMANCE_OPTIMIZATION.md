# Directory Performance Optimization Guide

## 🎯 Current Performance Issues
- Directory loading slowly even with small datasets (11 records)
- No optimized indexes for new filter fields (`year_of_leaving`, `last_class`)
- Missing critical index on `is_approved` field
- No composite indexes for common query patterns

## 🚀 Index Optimization Strategy

### **Critical Indexes (Must Have)**

#### 1. **is_approved Index** ⭐ **HIGHEST PRIORITY**
```sql
CREATE INDEX idx_profiles_is_approved ON profiles(is_approved) WHERE is_approved = TRUE;
```
- **Why:** Every directory query filters by `is_approved = TRUE`
- **Impact:** Massive performance improvement for directory queries
- **Query Pattern:** `WHERE is_approved = TRUE`

#### 2. **New Filter Fields**
```sql
CREATE INDEX idx_profiles_year_of_leaving ON profiles(year_of_leaving);
CREATE INDEX idx_profiles_last_class ON profiles(last_class);
```
- **Why:** New enhanced filters use these fields
- **Impact:** Fast decade-based and class-based filtering
- **Query Patterns:** `WHERE year_of_leaving BETWEEN 1990 AND 1999`, `WHERE last_class = 12`

#### 3. **Ordering Index**
```sql
CREATE INDEX idx_profiles_created_at_desc ON profiles(created_at DESC);
```
- **Why:** Directory orders by `created_at DESC`
- **Impact:** Eliminates expensive sorting operations
- **Query Pattern:** `ORDER BY created_at DESC`

### **Composite Indexes (Performance Boost)**

#### 4. **Approved + Filter Combinations**
```sql
-- For year filtering on approved users
CREATE INDEX idx_profiles_approved_year ON profiles(is_approved, year_of_leaving) WHERE is_approved = TRUE;

-- For class filtering on approved users  
CREATE INDEX idx_profiles_approved_class ON profiles(is_approved, last_class) WHERE is_approved = TRUE;

-- For profession filtering on approved users
CREATE INDEX idx_profiles_approved_profession ON profiles(is_approved, profession) WHERE is_approved = TRUE;
```
- **Why:** Most queries combine `is_approved = TRUE` with filters
- **Impact:** Single index lookup instead of multiple operations
- **Query Patterns:** `WHERE is_approved = TRUE AND year_of_leaving BETWEEN 1990 AND 1999`

#### 5. **Pagination Optimization**
```sql
CREATE INDEX idx_profiles_approved_created_desc ON profiles(is_approved, created_at DESC) WHERE is_approved = TRUE;
```
- **Why:** Pagination queries use both `is_approved = TRUE` and `ORDER BY created_at DESC`
- **Impact:** Eliminates sorting for paginated results
- **Query Pattern:** `WHERE is_approved = TRUE ORDER BY created_at DESC LIMIT 12`

### **Additional Optimizations**

#### 6. **Phone Index (OTP Login)**
```sql
CREATE INDEX idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;
```
- **Why:** OTP login queries by phone number
- **Impact:** Fast phone number lookups
- **Query Pattern:** `WHERE phone = '+917980699083'`

#### 7. **Full Text Search (Future Enhancement)**
```sql
CREATE INDEX idx_profiles_full_name_text ON profiles USING gin(to_tsvector('english', full_name));
```
- **Why:** Enable fast name searching
- **Impact:** Fast text search capabilities
- **Query Pattern:** `WHERE to_tsvector('english', full_name) @@ plainto_tsquery('john')`

## 📊 Expected Performance Impact

### **Before Optimization:**
- Directory load time: ~7 seconds (with 11 records)
- Query execution: Table scans and expensive sorting
- Scalability: Poor performance with growth

### **After Optimization:**
- Directory load time: <1 second (with 11 records)
- Query execution: Index-only scans
- Scalability: Excellent performance with thousands of records

## 🎯 Implementation Priority

### **Phase 1: Critical Indexes (Immediate)**
1. `idx_profiles_is_approved` - **CRITICAL**
2. `idx_profiles_created_at_desc` - **CRITICAL**
3. `idx_profiles_year_of_leaving` - **HIGH**
4. `idx_profiles_last_class` - **HIGH**

### **Phase 2: Composite Indexes (Performance Boost)**
5. `idx_profiles_approved_created_desc` - **HIGH**
6. `idx_profiles_approved_year` - **MEDIUM**
7. `idx_profiles_approved_class` - **MEDIUM**
8. `idx_profiles_approved_profession` - **MEDIUM**

### **Phase 3: Additional Optimizations**
9. `idx_profiles_phone` - **MEDIUM**
10. `idx_profiles_full_name_text` - **LOW**

## 🔧 Implementation Steps

1. **Run the index creation script:**
   ```bash
   psql -d your_database -f optimize-directory-indexes.sql
   ```

2. **Verify index usage:**
   ```sql
   EXPLAIN (ANALYZE, BUFFERS) 
   SELECT id, full_name, year_of_leaving, last_class, profession 
   FROM profiles 
   WHERE is_approved = TRUE 
   ORDER BY created_at DESC 
   LIMIT 12;
   ```

3. **Monitor performance improvements:**
   - Directory load time should drop from ~7s to <1s
   - Query execution plans should show index usage
   - Memory usage should decrease

## 📈 Scalability Benefits

- **1,000 records:** Sub-second load times
- **10,000 records:** Still sub-second with proper pagination
- **100,000 records:** Excellent performance with composite indexes
- **Filter combinations:** Near-instant filtering with composite indexes

## 🚨 Important Notes

- **Index Maintenance:** Indexes require maintenance overhead for writes
- **Storage Impact:** Indexes consume additional storage space
- **Write Performance:** More indexes = slower INSERT/UPDATE operations
- **Monitoring:** Monitor index usage and drop unused indexes

## ✅ Success Metrics

- [ ] Directory loads in <1 second
- [ ] Filter operations complete in <500ms
- [ ] Pagination works smoothly
- [ ] Query execution plans show index usage
- [ ] Memory usage optimized

