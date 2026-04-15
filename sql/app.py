from flask import Flask, render_template, request, redirect, url_for
import psycopg2

app = Flask(__name__)

# Función para conectar a la base de datos SIGAS que creaste en pgAdmin
def conectar_db():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="SIGAS",
            user="postgres",
            password="TU_CONTRASEÑA", # Reemplaza con tu contraseña de Postgres
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"Error de conexión: {e}")
        return None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    usuario = request.form.get('usuario')
    password = request.form.get('password')
    
    conn = conectar_db()
    if conn:
        cur = conn.cursor()
        # Buscamos en la tabla Usuarios (fíjate en las mayúsculas de las columnas)
        query = 'SELECT * FROM "Usuarios" WHERE "Nombre" = %s AND "Pass" = %s'
        cur.execute(query, (usuario, password))
        user = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if user:
            return "¡Login exitoso! Bienvenido al sistema SIGAS."
        else:
            return "Usuario o contraseña incorrectos."
    return "Error al conectar con la base de datos."

if __name__ == '__main__':
    app.run(debug=True)