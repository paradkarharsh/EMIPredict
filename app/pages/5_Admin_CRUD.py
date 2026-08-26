"""
Streamlit Page: Admin CRUD Database Portal.
Implements full Create, Read, Update, and Delete operations against a local SQLite database (data/emipredict.db).
"""

import streamlit as st
import pathlib
import sqlite3
import pandas as pd

st.set_page_config(page_title="Admin CRUD - EMIPredict AI", page_icon="⚙️", layout="wide")

st.title("⚙️ Admin Database & CRUD Portal")
st.caption("Full Create, Read, Update, and Delete operations against the SQLite credit application database.")

DB_PATH = pathlib.Path("data/emipredict.db")

def init_sqlite_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS loan_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            age INTEGER,
            gender TEXT,
            marital_status TEXT,
            education TEXT,
            monthly_salary REAL,
            employment_type TEXT,
            years_of_employment INTEGER,
            company_type TEXT,
            house_type TEXT,
            monthly_rent REAL,
            family_size INTEGER,
            dependents INTEGER,
            school_fees REAL,
            college_fees REAL,
            travel_expenses REAL,
            groceries_utilities REAL,
            other_monthly_expenses REAL,
            existing_loans TEXT,
            current_emi_amount REAL,
            credit_score INTEGER,
            bank_balance REAL,
            emergency_fund REAL,
            emi_scenario TEXT,
            requested_amount REAL,
            requested_tenure INTEGER,
            emi_eligibility TEXT,
            max_monthly_emi REAL
        )
    """)
    conn.commit()
    
    # Check if empty, seed with initial 1,000 records from raw CSV
    cursor.execute("SELECT COUNT(*) FROM loan_applications")
    count = cursor.fetchone()[0]
    if count == 0:
        csv_path = pathlib.Path("data/raw/EMI_dataset.csv")
        if csv_path.exists():
            df_seed = pd.read_csv(csv_path).head(1000)
            df_seed.to_sql("loan_applications", conn, if_exists="append", index=False)
            print("Seeded SQLite database with 1,000 initial application records.")
            
    conn.close()

init_sqlite_db()

def get_db_connection():
    return sqlite3.connect(DB_PATH)

tab_read, tab_create, tab_update, tab_delete = st.tabs([
    "🔍 Read / Search Records",
    "➕ Create New Application",
    "✏️ Update Record",
    "❌ Delete Record"
])

# 1. READ / SEARCH
with tab_read:
    st.subheader("🔍 Search & Filter Database Records")
    
    search_col1, search_col2 = st.columns(2)
    with search_col1:
        search_id = st.number_input("Search by Application ID (0 for all)", min_value=0, value=0)
    with search_col2:
        search_status = st.selectbox("Filter by Eligibility", ["All", "Eligible", "High_Risk", "Not_Eligible"])
        
    conn = get_db_connection()
    if search_id > 0:
        query = f"SELECT * FROM loan_applications WHERE id = {search_id}"
    elif search_status != "All":
        query = f"SELECT * FROM loan_applications WHERE emi_eligibility = '{search_status}' ORDER BY id DESC LIMIT 500"
    else:
        query = "SELECT * FROM loan_applications ORDER BY id DESC LIMIT 500"
        
    df_records = pd.read_sql_query(query, conn)
    conn.close()
    
    st.markdown(f"**Total Found**: `{len(df_records)}` records")
    st.dataframe(df_records, use_container_width=True)

# 2. CREATE
with tab_create:
    st.subheader("➕ Add New Credit Loan Application")
    with st.form("create_app_form"):
        c1, c2, c3 = st.columns(3)
        with c1:
            c_age = st.number_input("Age", 25, 60, 30)
            c_gender = st.selectbox("Gender ", ["Male", "Female"])
            c_marital = st.selectbox("Marital Status ", ["Single", "Married"])
            c_edu = st.selectbox("Education ", ["High School", "Graduate", "Post Graduate", "Professional"])
            c_salary = st.number_input("Monthly Salary (INR) ", 15000, 500000, 60000)
            c_emp_type = st.selectbox("Employment Type ", ["Private", "Government", "Self-employed"])

        with c2:
            c_yoe = st.number_input("Years of Employment ", 0, 40, 5)
            c_comp = st.selectbox("Company Type ", ["Private Ltd", "MNC", "Public Sector", "Startup"])
            c_house = st.selectbox("House Type ", ["Rented", "Own", "Family"])
            c_rent = st.number_input("Monthly Rent ", 0, 100000, 10000)
            c_fam = st.number_input("Family Size ", 1, 10, 3)
            c_dep = st.number_input("Dependents ", 0, 8, 1)

        with c3:
            c_cscore = st.slider("Credit Score ", 300, 850, 720)
            c_loans = st.selectbox("Existing Loans ", ["No", "Yes"])
            c_cur_emi = st.number_input("Current EMI ", 0, 100000, 0)
            c_scen = st.selectbox("Scenario ", ["E-commerce Shopping EMI", "Home Appliances EMI", "Vehicle EMI", "Personal Loan EMI", "Education EMI"])
            c_req_amt = st.number_input("Requested Amount ", 10000, 1500000, 100000)
            c_req_ten = st.number_input("Tenure (Months) ", 3, 84, 18)
            c_elig = st.selectbox("Initial Eligibility ", ["Eligible", "High_Risk", "Not_Eligible"])
            c_max_emi = st.number_input("Max Safe EMI ", 500, 50000, 15000)

        create_btn = st.form_submit_button("Insert Record to SQLite", use_container_width=True)
        
    if create_btn:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO loan_applications (
                age, gender, marital_status, education, monthly_salary, employment_type,
                years_of_employment, company_type, house_type, monthly_rent, family_size,
                dependents, school_fees, college_fees, travel_expenses, groceries_utilities,
                other_monthly_expenses, existing_loans, current_emi_amount, credit_score,
                bank_balance, emergency_fund, emi_scenario, requested_amount, requested_tenure,
                emi_eligibility, max_monthly_emi
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            c_age, c_gender, c_marital, c_edu, c_salary, c_emp_type,
            c_yoe, c_comp, c_house, c_rent, c_fam, c_dep,
            2000, 0, 3000, 8000, 2000, c_loans, c_cur_emi, c_cscore,
            50000, 20000, c_scen, c_req_amt, c_req_ten, c_elig, c_max_emi
        ))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        st.success(f"Successfully inserted record with Application ID: {new_id}")

# 3. UPDATE
with tab_update:
    st.subheader("✏️ Update Existing Application")
    up_id = st.number_input("Enter Record ID to Modify", min_value=1, value=1)
    
    conn = get_db_connection()
    df_single = pd.read_sql_query(f"SELECT * FROM loan_applications WHERE id = {up_id}", conn)
    conn.close()
    
    if not df_single.empty:
        rec = df_single.iloc[0]
        st.info(f"Modifying Application ID #{up_id}")
        with st.form("update_form"):
            u_sal = st.number_input("Monthly Salary (INR)", value=float(rec["monthly_salary"]))
            u_cscore = st.slider("Credit Score", 300, 850, int(rec["credit_score"]))
            u_elig = st.selectbox("Eligibility Status", ["Eligible", "High_Risk", "Not_Eligible"], index=["Eligible", "High_Risk", "Not_Eligible"].index(rec["emi_eligibility"]))
            u_max_emi = st.number_input("Max Safe EMI (INR)", value=float(rec["max_monthly_emi"]))
            
            update_btn = st.form_submit_button("Save Changes to Database", use_container_width=True)
            
        if update_btn:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE loan_applications
                SET monthly_salary = ?, credit_score = ?, emi_eligibility = ?, max_monthly_emi = ?
                WHERE id = ?
            """, (u_sal, u_cscore, u_elig, u_max_emi, up_id))
            conn.commit()
            conn.close()
            st.success(f"Record #{up_id} successfully updated.")
    else:
        st.warning(f"Record with ID #{up_id} not found in SQLite database.")

# 4. DELETE
with tab_delete:
    st.subheader("❌ Delete Application Record")
    del_id = st.number_input("Enter Record ID to Permanently Delete", min_value=1, value=1)
    confirm_del = st.checkbox(f"Confirm deletion of Application #{del_id}")
    
    if st.button("Delete Record from Database", type="primary"):
        if confirm_del:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(f"DELETE FROM loan_applications WHERE id = {del_id}")
            rows_affected = cursor.rowcount
            conn.commit()
            conn.close()
            if rows_affected > 0:
                st.success(f"Application #{del_id} successfully deleted.")
            else:
                st.error(f"Record #{del_id} not found.")
        else:
            st.warning("Please check the confirmation box before deleting.")
