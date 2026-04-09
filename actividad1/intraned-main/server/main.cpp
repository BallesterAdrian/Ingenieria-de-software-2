/**
 * @file main.cpp
 * @author Gabriel Nicolás González Ferreira
 * @brief Servidor principal - Versión de alta compatibilidad - Carga Dinámica (Windows)
 * @version 0.3
 */

#include <iostream>
#include <windows.h> // Biblioteca para carga dinámica en Windows

int main()
{
    // Cargar la biblioteca compartida
    HMODULE handle = LoadLibrary("servidor.dll"); // Usamos L"" para wchar_t*
    if (!handle) {
        DWORD error = GetLastError(); // Obtener el código de error específico
        std::cerr << "Error al abrir la biblioteca DLL. Código de error: " << error << std::endl;
        return 1;
    }

    // Buscar la función 'iniciar_servidor' en la biblioteca
    // Definimos el tipo de la función que esperamos
    typedef void (*iniciar_servidor_t)(const char*, int);
    // Obtenemos la dirección de la función
    iniciar_servidor_t iniciar_servidor = (iniciar_servidor_t) GetProcAddress(handle, "iniciar_servidor");

    if (!iniciar_servidor) {
        DWORD error = GetLastError();
        std::cerr << "Error al encontrar la función 'iniciar_servidor'. Código de error: " << error << std::endl;
        FreeLibrary(handle); // Liberar la DLL antes de salir
        return 1;
    }

    // Llamar a la función cargada dinámicamente
    iniciar_servidor("0.0.0.0", 8080);

    // Liberar la biblioteca (esto no se alcanza porque listen() es bloqueante)
    FreeLibrary(handle);
    return 0;
}