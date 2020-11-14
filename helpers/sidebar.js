const getMenu = (rol) => {

    const menu = [
        /*{
                    opcion: 'Home',
                    icono: 'mdi mdi-gauge',
                    submenu: [
                        { opcion: 'Dashboard', url: '/dashboard' }
                    ]
                },*/
        {
            opcion: 'Registro',
            icono: 'mdi mdi-view-dashboard',
            submenu: [
                { opcion: 'Socio', url: '/registro/gestion/socio/0' },
                { opcion: 'Producto', url: '/registro/gestion/credito' },
                { opcion: 'Ahorro', url: '/registro/gestion/ahorro' }
            ]
        },
        {
            opcion: 'Operaciones',
            icono: 'mdi mdi-chart-bubble',
            submenu: [
                { opcion: 'Productos vigentes', url: '/operaciones/gestion/producto' },
                { opcion: 'Ahorros', url: '/operaciones/gestion/ahorro-consulta' },
                { opcion: 'Productos históricos', url: '/operaciones/consulta/producto-historico' }
            ]
        },
        {
            opcion: 'Caja',
            icono: 'mdi mdi-cart',
            submenu: [
                { opcion: 'Pago producto', url: '/caja/pago/producto-caja' },
                { opcion: 'Pago ahorro', url: 'caja/pago/ahorro-caja' },
                // { opcion: 'Confirmar pago de analistas', url: '/caja/pago/confirmar-pago-analista' },
                { opcion: 'Ingresos y egresos', url: '/caja/gestion/ingresos-egresos' },
                // { opcion: 'Apertura de caja general', url: '/registro/gestion/cierre-caja' },
                // { opcion: 'Apertura de caja individual', url: '/registro/gestion/cierre-caja' },
                // { opcion: 'Cierre de caja general', url: '/registro/gestion/cierre-caja-general' },
                { opcion: 'Cierre de caja individual', url: '/caja/pago/cierre-caja-individual' },
                { opcion: 'Listar Cajas', url: '/caja/pago/cajas-lista' },
                { opcion: 'Listar Recibos', url: '/caja/gestion/lista-recibo' },
                // { opcion: 'Anular recibo', url: '/registro/gestion/cierre-caja' },
                // { opcion: 'Duplicado de recibo', url: '/registro/gestion/cierre-caja' }
            ]
        },
        {
            opcion: 'Analista',
            icono: 'mdi mdi-gauge',
            submenu: [
                // { opcion: 'Ingresos y egresos', url: '/registro/gestion/caja-ingresos-egresos' },
                // { opcion: 'Cierre de caja', url: '/registro/gestion/cierre-caja' }
                { opcion: 'Recaudación', url: '/analista/gestion/producto-pre-pago' }
            ]
        }
    ];

    if (rol.includes('Administrador')) {
        // menu[1].submenu.unshift({});
        menu.unshift({
                opcion: 'Seguridad',
                icono: 'mdi mdi-account-key',
                submenu: [
                    { opcion: 'Usuarios', url: '/seguridad/gestion/usuario' },
                    // { opcion: 'Roles', url: '/seguridad/gestion/rol' },
                    // { opcion: 'Analistas', url: '/seguridad/gestion/rol' },
                    // { opcion: 'Cajeros', url: '/seguridad/gestion/rol' },
                    { opcion: 'Caja', url: '/seguridad/gestion/caja' },
                    { opcion: 'Analistas', url: '/seguridad/gestion/analista' },
                    // { opcion: 'Cajeros', url: '/seguridad/gestion/rol' }
                ]
            }
            /*, {
                        opcion: 'Reportes',
                        icono: 'mdi mdi-clipboard-text',
                        submenu: [
                            { opcion: 'Diario', url: '/seguridad/gestion/usuario' }
                        ]
                    }*/
        );
    }

    return menu;
}

module.exports = {
    getMenu
}