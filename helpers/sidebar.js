const getMenu = (rol) => {

    const menu = [{
            opcion: 'Registro',
            icono: 'mdi mdi-view-dashboard',
            submenu: [
                { opcion: 'Gestionar Socio', url: '/registro/gestion/socio/0' },
                { opcion: 'Gestionar Producto', url: '/registro/gestion/producto' },
                { opcion: 'Gestionar Ahorro', url: '/registro/gestion/ahorro' },
            ]
        },
        {
            opcion: 'Operaciones',
            icono: 'mdi mdi-chart-bubble',
            submenu: [
                { opcion: 'Gestionar Productos Vigentes', url: '/operaciones/gestion/producto' },
                { opcion: 'Gestionar Ahorros', url: '/operaciones/gestion/ahorro-consulta' },
                { opcion: 'Consultar Productos Históricos', url: '/operaciones/consulta/producto-historico' },
            ]
        },
    ];

    if (rol.includes('Administrador')) {
        menu.unshift({
            opcion: 'Seguridad',
            icono: 'mdi mdi-account-key',
            submenu: [
                { opcion: 'Gestionar Usuarios', url: '/seguridad/gestion/usuario' },
                { opcion: 'Gestionar Cajas y Cajeros', url: '/seguridad/gestion/caja' },
                { opcion: 'Gestionar Analistas', url: '/seguridad/gestion/analista' },
            ]
        }, );
    }

    if (rol.includes('Administrador') || rol.includes('Analista')) {
        menu.push({
            opcion: 'Analista',
            icono: 'mdi mdi-gauge',
            submenu: [
                { opcion: 'Registrar Recaudación', url: '/analista/gestion/producto-pre-pago' },
            ]
        });
    }

    if (rol.includes('Administrador') || rol.includes('Cajero')) {
        menu.push({
            opcion: 'Caja',
            icono: 'mdi mdi-cart',
            submenu: [
                { opcion: 'Pagar Producto', url: '/caja/pago/producto-caja' },
                { opcion: 'Pagar Ahorro', url: '/caja/pago/ahorro-caja' },
                { opcion: 'Retirar Ahorros Producto', url: '/caja/retiro/producto-retiro-ahorros' },
                { opcion: 'Realizar Ingresos - Egresos', url: '/caja/gestion/ingresos-egresos' },
                { opcion: 'Cerrar Caja Individual', url: '/caja/pago/cierre-caja-individual' },
                { opcion: 'Gestionar Transacciones', url: '/caja/gestion/lista-recibo' },
            ]
        });
    }

    if (rol.includes('Administrador') || rol.includes('Analista')) {
        menu.push({
            opcion: 'Reportes',
            icono: 'mdi mdi-briefcase',
            submenu: [
                { opcion: 'Consultar Cajas Individuales', url: '/caja/pago/cajas-lista' },
                { opcion: 'Libro Diario - Ingresos', url: '/reporte/libro-diario/ingresos' },
                { opcion: 'Libro Diario - Egresos', url: '/reporte/libro-diario/egresos' },
                { opcion: 'Saldo de Créditos', url: '/reporte/analista/saldo-creditos' },
            ]
        });
    }

    // if (rol.includes('Administrador')) {
    //     menu.push({
    //         opcion: 'Reportes',
    //         icono: 'mdi mdi-briefcase',
    //         submenu: [
    //             { opcion: 'Consultar Cajas Individuales', url: '/caja/pago/cajas-lista' },
    //             // { opcion: 'Libro Diario - Ingresos', url: '/reporte/libro-diario/ingresos' },
    //             // { opcion: 'Libro Diario - Egresos', url: '/reporte/libro-diario/egresos' },
    //             { opcion: 'Saldo de Créditos', url: '/reporte/analista/saldo-creditos' },
    //         ]
    //     });
    // }

    return menu;
}

module.exports = {
    getMenu
}