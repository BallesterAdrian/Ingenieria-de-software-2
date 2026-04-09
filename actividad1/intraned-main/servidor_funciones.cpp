// servidor_funciones.cpp

// Definir la versión de Windows explícitamente (Windows 10/11)
#define _WIN32_WINNT 0x0A00 // 0x0A00 = Windows 10
#define WIN32_LEAN_AND_MEAN // Excluye funciones no necesarias de Windows.h
#include <windows.h> // Incluir windows.h antes de httplib.h es crucial

#include "server/include/httplib.h"
#include "server/include/json.hpp"
#include "server/utils/fileHelper.cpp"

#include <iostream>
#include <fstream>
#include <sys/stat.h>
#include <sys/types.h>

using json = nlohmann::json;

void asegurar_directorio(const std::string& path) {
    struct stat info;
    if (stat(path.c_str(), &info) != 0) {
        #ifdef _WIN32
            mkdir(path.c_str());
        #else
            mkdir(path.c_str(), 0777);
        #endif
    }
}

const std::string ADMIN_TOKEN = "educacion_libre_2026";

extern "C" __declspec(dllexport) void iniciar_servidor(const char* host, int port) {
    const std::string upload_dir = "./server/uploads";
    asegurar_directorio(upload_dir);

    httplib::Server svr;

    svr.set_mount_point("/", "./public");
    svr.set_mount_point("/recursos", upload_dir);

    svr.Post("/api/login", [](const httplib::Request &req, httplib::Response &res) {
        try {
            auto j_input = json::parse(req.body);
            if (j_input["password"] == "admin123") {
                res.set_content("{\"token\": \"" + ADMIN_TOKEN + "\"}", "application/json");
            } else {
                res.status = 401;
                res.set_content("{\"error\": \"No autorizado\"}", "application/json");
            }
        } catch (...) {
            res.status = 400;
            res.set_content("{\"error\": \"JSON invalido\"}", "application/json");
        }
    });

    svr.Get("/api/contenidos", [&](const httplib::Request &, httplib::Response &res) {
        std::ifstream file(upload_dir + "/metadata.json");
        if (file.is_open()) {
            json db;
            file >> db;
            res.set_content(db.dump(), "application/json");
        } else {
            res.set_content("{\"contenidos\": []}", "application/json");
        }
    });

    svr.Post("/api/upload", [&upload_dir](const httplib::Request &req, httplib::Response &res) {
        if (req.get_header_value("Authorization") != ADMIN_TOKEN) {
            res.status = 403;
            res.set_content("{\"error\": \"Token invalido\"}", "application/json");
            return;
        }

        if (!req.form.has_file("archivo")) {
            res.status = 400;
            res.set_content("{\"error\": \"Falta el archivo\"}", "application/json");
            return;
        }

        const auto &file_part = req.form.get_file("archivo");
        std::string titulo = req.form.get_field("titulo");
        std::string autor = req.form.get_field("autor");
        std::string tema = req.form.get_field("tema");
        std::string filename = file_part.filename;

        std::string path = upload_dir + "/" + filename;
        std::ofstream ofs(path, std::ios::binary);
        
        if (ofs.is_open()) {
            ofs << file_part.content;
            ofs.close();

            json nuevo = {
                {"titulo", titulo},
                {"autor", autor},
                {"tema", tema},
                {"file", filename}
            };
            
            if (FileHelper::registrarArchivo(nuevo)) {
                res.set_content("{\"status\": \"success\"}", "application/json");
            } else {
                res.status = 500;
                res.set_content("{\"error\": \"Error en metadata\"}", "application/json");
            }
        } else {
            res.status = 500;
            res.set_content("{\"error\": \"Error de E/S en disco\"}", "application/json");
        }
    });

    std::cout << "Servidor iniciado en http://" << host << ":" << port << " (Modo compatibilidad POSIX)" << std::endl;
    svr.listen(host, port);
}