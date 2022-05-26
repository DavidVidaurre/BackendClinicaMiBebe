const { Router } = require('express');
const router = Router();

const {
    CrearMedicamentoReceta,
    ActualizarMedicamentoReceta,
    EliminarMedicamentoReceta,
    MostrarNombreMedicina
} = require('../controllers/MedicamentoReceta');

// Métodos HTTP
router.post("/new", CrearMedicamentoReceta);
router.put("/:id", ActualizarMedicamentoReceta)
router.delete("/:id", EliminarMedicamentoReceta)
router.get('/nombresMedicina', MostrarNombreMedicina)

module.exports = router;