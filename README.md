---

## ⚙️ Core Features – Stage 1 (MVP)

- [x] Text-based procedural 3D world generation
- [x] WebGL visualization with React Three Fiber
- [x] `.glb` export for custom-created scenes
- [ ] "🧼 Clean Topology" button with backend processing
- [ ] Download production-ready mesh for engines like Unreal/Unity

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- React Three Fiber (Three.js)
- Drei helpers
- GLTFExporter

**Backend**
- Python
- FastAPI or Flask
- Blender (headless)
- Optional: Meshlab / Instant Meshes for automated remesh

---

## ✨ Clean Topology Workflow

After generating a 3D world:
1. The user can preview and export it  
2. By clicking `🧼 Clean Topology`, the mesh is:
   - Cleaned via Blender (deduplicate vertices, fix normals)
   - Retopologized or simplified
   - Returned as a new `.glb` optimized for production use

---

## 🌐 Branding Overview

**Project name:** Mundrix  
**Slogan:** *Procedural Worlds. Quantum Born.*  
**Logo Symbol:** Quantum orbit + voxel grid fusion  
**Vision:** Accessible, AI-assisted world creation  
**Focus:** Web-first, text-based worldbuilding for prototyping, game art, and virtual experiences

---

## 🗺️ Technical Roadmap (MVP Phase)

| Week | Objective                                      |
|------|------------------------------------------------|
| 1    | Set up project & basic scene generation        |
| 2    | 3D visualization + `.glb` export via Three.js  |
| 3    | Add "Clean Topology" backend w/ Blender        |
| 4    | UI polish + deploy prototype for testing       |

---

## 📬 Community (coming soon)

- [ ] Discord community for builders
- [ ] Twitter/X: [@mundrix3d](https://twitter.com/mundrix3d)
- [ ] Official site: [mundrix.io](https://mundrix.io) *(TBD)*

---

## 📄 License

To be defined. Suggested:
- **MIT** for frontend/backend
- Custom or limited license for generated 3D content

---
