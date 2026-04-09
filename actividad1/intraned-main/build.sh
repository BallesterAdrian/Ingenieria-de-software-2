#!/bin/bash

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Iniciando compilación de la Isla de Conocimiento...${NC}"

# 1. Crear carpetas necesarias si no existen
mkdir -p build
mkdir -p uploads

# 2. Compilación con G++
# -O3: Optimización máxima de rendimiento.
# -s: Remueve la tabla de símbolos (reduce el tamaño del binario).
# -pthread: Necesario para httplib (multihilo).
# g++ -std=c++17 -O3 -s server/main.cpp -o build/servidor_educativo -pthread -I server/include
g++ -O3 -s server/main.cpp -o build/intraned -pthread -I server/include

# 3. Verificar si la compilación fue exitosa
if [ $? -eq 0 ]; then
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN} Compilación exitosa en: build/servidor_educativo ${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo -e "Para iniciar el servidor, ejecuta: ./build/intraned"
else
    echo "Error en la compilación. Revisa las dependencias en server/include/"
fi