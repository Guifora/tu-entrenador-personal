import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.neighbors import NearestNeighbors

# Cargar y limpiar dataset
df = pd.read_csv("data/prueba.csv")

# Verificar columnas esenciales
columnas_requeridas = [
    'Categoria', 'Dificultad', 'Tipo_Ejercicio', 'Grupo_Muscular_Primario',
    'Duracion_Estimada_x_Set(min)', 'Quemado_Calorico_x_Minuto', 'Impacto'
]

missing = set(columnas_requeridas) - set(df.columns)
if missing:
    raise ValueError(f"🚨 Columnas faltantes en el CSV: {missing}")

print("\n✅ Columnas correctas:", df.columns.tolist())

# Limpieza de datos mejorada
numeric_cols = ['Duracion_Estimada_x_Set(min)', 'Quemado_Calorico_x_Minuto', 'Impacto']
categorical_cols = ['Categoria', 'Dificultad', 'Tipo_Ejercicio', 'Grupo_Muscular_Primario']

# Convertir y limpiar columnas numéricas
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')
    
# Limpiar NaNs en columnas categóricas
for col in categorical_cols:
    df[col] = df[col].fillna('Desconocido').astype(str)

# Eliminar filas con valores inválidos en columnas críticas
df = df.dropna(subset=numeric_cols + ['Categoria', 'Dificultad'])

# Mapeo de dificultad global
dificultad_map = {'Principiante': 1, 'Intermedio': 2, 'Avanzado': 3}

# Preprocesador corregido
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
    ])

# Validación de datos antes del entrenamiento
if df.empty:
    raise ValueError("Dataset vacío después de la limpieza")

X = preprocessor.fit_transform(df)

mapeo_categorias = {
    'trenSuperior': 'Tren Superior',
    'trenInferior': 'Tren Inferior',
    'core': 'Core',
    'fullbody': 'Full Body' 
}
class Recomendador:
    def __init__(self, data):
        self.model = NearestNeighbors(n_neighbors=15, metric='euclidean', algorithm='brute')
        self.model.fit(data)
    
    def recomendar(self, user_profile):
        distances, indices = self.model.kneighbors(user_profile)
        return indices.flatten()

def filtrar_ejercicios(df, user_input):
    
    print("\nFiltros aplicados:")
    print(f"- Categoría: {user_input['parte_cuerpo']}")
    print(f"- Impacto máximo: {user_input['impacto_max']}")
    print(f"- Dificultad máxima: {user_input['nivel']}")
    print(f"- Intensidad: {user_input['intensidad_preferida']}")

    # Validar mapeo de categoría
    categoria_filtro = mapeo_categorias.get(user_input['parte_cuerpo'], None)
    if not categoria_filtro:
        raise ValueError(f"Categoría no válida: {user_input['parte_cuerpo']}")

    filtros = (
        (df['Dificultad'].map(dificultad_map) <= dificultad_map[user_input['nivel']]) &
        (df['Impacto'] <= user_input['impacto_max']) & 
        (df['Duracion_Estimada_x_Set(min)'] <= user_input['tiempo_max_ejercicio']) &
        (df['Intensidad'] == user_input['intensidad_preferida']) &
        (df['Categoria'] == categoria_filtro)
    )

    ejercicios_filtrados = df[filtros].copy()
    
    print("\nEjercicios que pasan los filtros:")
    print(ejercicios_filtrados[['Ejercicio', 'Categoria', 'Impacto', 'Dificultad', 'Intensidad']])
    
    return ejercicios_filtrados

def asignar_reps(row, nivel_usuario):
    try:
        reps_range = list(map(int, row['Reps_Recomendadas'].split('-')))
        if nivel_usuario == "Principiante":
            return max(reps_range)
        elif nivel_usuario == "Intermedio":
            return sum(reps_range) // 2
        else:
            return min(reps_range)
    except Exception as e:
        print(f"Error asignando reps: {e}")
        return reps_range[0] if reps_range else 10

def optimizar_rutina(ejercicios, tiempo_max):
    ejercicios = ejercicios.sort_values(
        by=['Quemado_Calorico_x_Minuto', 'Impacto'], 
        ascending=[False, False]
    )
    
    tiempo_acumulado = 0
    rutina = []
    grupos_usados = set()
    
    for _, ej in ejercicios.iterrows():
        if tiempo_acumulado + ej['Duracion_Estimada_x_Set(min)'] > tiempo_max:
            continue
            
        if ej['Grupo_Muscular_Primario'] not in grupos_usados:
            rutina.append(ej)
            tiempo_acumulado += ej['Duracion_Estimada_x_Set(min)']
            grupos_usados.add(ej['Grupo_Muscular_Primario'])
            
        if tiempo_acumulado >= tiempo_max * 0.9:
            break
            
    return pd.DataFrame(rutina)

def generar_recomendacion(usuario):
    try:
        # Validación de parámetros esenciales
        required_params = ['peso', 'altura', 'nivel']
        if any(param not in usuario for param in required_params):
            return {"error": "Datos de usuario incompletos"}, 400
            
        # 1. Calcular IMC
        imc = usuario['peso'] / ((usuario['altura']/100) ** 2)
        
        # 2. Filtrar ejercicios
        filtros_usuario = {
            'nivel': usuario.get('nivel', 'Intermedio'),
            'impacto_max': usuario.get('impacto_max', 3),
            'tiempo_max_ejercicio': usuario.get('tiempo_max_ejercicio', 15),
            'intensidad_preferida': usuario.get('intensidad_preferida', 'Media'),
            'parte_cuerpo': usuario.get('parte_cuerpo', 'fullbody')
        }
        
        ejercicios_filtrados = filtrar_ejercicios(df, filtros_usuario)
        
        if ejercicios_filtrados.empty:
            return {"error": "No se encontraron ejercicios con tus criterios"}, 404
        
        # 3. Validar columnas críticas después del filtrado
        required_cols = numeric_cols + categorical_cols
        missing_cols = set(required_cols) - set(ejercicios_filtrados.columns)
        if missing_cols:
            raise ValueError(f"Columnas perdidas: {missing_cols}")
        
        # 4. Transformación de datos
        X_ejercicios = preprocessor.transform(ejercicios_filtrados)
        
        # 5. Crear perfil del usuario 
        user_data = pd.DataFrame([[
            # Valores para columnas numéricas (mismo orden que en numeric_cols)
            usuario.get('tiempo_max_ejercicio', 15),  # Duracion_Estimada_x_Set(min)
            usuario.get('peso', 70) * 0.07,           # Quemado_Calorico_x_Minuto estimado
            usuario.get('impacto_max', 3),             # Impacto
            
            # Valores para columnas categóricas (mismo orden que en categorical_cols)
            mapeo_categorias[usuario['parte_cuerpo']],  # Categoria
            usuario['nivel'],                           # Dificultad
            'Strength',                                 # Tipo_Ejercicio (valor por defecto)
            'Full Body'                                 # Grupo_Muscular_Primario (valor por defecto)
        ]], columns=numeric_cols + categorical_cols)

        # Transformar el perfil del usuario
        user_profile = preprocessor.transform(user_data)

        # 6. Generar recomendación 
        recomendador = Recomendador(X_ejercicios)
        distances, indices = recomendador.model.kneighbors(user_profile)  # ¡Ahora user_profile está definido!
        indices = indices.flatten()
        
        # 7. Optimizar rutina
        rutina_optima = optimizar_rutina(
            ejercicios_filtrados.iloc[indices], 
            usuario.get('tiempo', 30)
        )
        
        if not rutina_optima.empty:
            # Asignación de sets y reps
            rutina_optima['Sets'] = rutina_optima['Sets_Recomendados'].astype(int)
            rutina_optima['Reps'] = rutina_optima.apply(
                lambda x: asignar_reps(x, usuario['nivel']), 
                axis=1
            )
            
            # Cálculo de métricas
            rutina_optima['Tiempo_Total'] = rutina_optima['Duracion_Estimada_x_Set(min)'] * rutina_optima['Sets']
            total_calorias = (rutina_optima['Quemado_Calorico_x_Minuto'] * rutina_optima['Tiempo_Total']).sum()
            
            return {
                "rutina": rutina_optima[[
                    'Ejercicio', 
                    'Sets', 
                    'Reps',
                    'Duracion_Estimada_x_Set(min)',
                    'Grupo_Muscular_Primario',
                    'Descripcion_Corta'
                ]].to_dict(orient='records'),
                "metricas": {
                    "total_tiempo": int(rutina_optima['Tiempo_Total'].sum()),
                    "total_calorias": round(total_calorias, 1),
                    "nivel_usuario": usuario['nivel']
                }
            }
        else:
            return {"error": "No se pudo generar una rutina"}, 404
            
    except Exception as e:
        print(f"Error en generación de recomendación: {str(e)}")
        return {"error": f"Error del sistema: {str(e)}"}, 500