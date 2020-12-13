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
                { opcion: 'Gestionar Socio', url: '/registro/gestion/socio/0' },
                { opcion: 'Gestionar Producto', url: '/registro/gestion/producto' },
                { opcion: 'Gestionar Ahorro', url: '/registro/gestion/ahorro' }
            ]
        },
        {
            opcion: 'Operaciones',
            icono: 'mdi mdi-chart-bubble',
            submenu: [
                { opcion: 'Gestionar Productos Vigentes', url: '/operaciones/gestion/producto' },
                { opcion: 'Gestionar Ahorros', url: '/operaciones/gestion/ahorro-consulta' },
                { opcion: 'Consultar Productos Históricos', url: '/operaciones/consulta/producto-historico' }
            ]
        }
        // {
        //     opcion: 'Caja',
        //     icono: 'mdi mdi-cart',
        //     submenu: [
        //         { opcion: 'Pagar Producto', url: '/caja/pago/producto-caja' },
        //         { opcion: 'Pagar Ahorro', url: 'caja/pago/ahorro-caja' },
        //         // { opcion: 'Confirmar pago de analistas', url: '/caja/pago/confirmar-pago-analista' },
        //         { opcion: 'Realizar Ingresos - Egresos', url: '/caja/gestion/ingresos-egresos' },
        //         // { opcion: 'Apertura de caja general', url: '/registro/gestion/cierre-caja' },
        //         // { opcion: 'Apertura de caja individual', url: '/registro/gestion/cierre-caja' },
        //         // { opcion: 'Cierre de caja general', url: '/registro/gestion/cierre-caja-general' },
        //         { opcion: 'Cerrar Caja Individual', url: '/caja/pago/cierre-caja-individual' },
        //         { opcion: 'Consultar Cajas Individuales', url: '/caja/pago/cajas-lista' },
        //         { opcion: 'Gestionar Transacciones', url: '/caja/gestion/lista-recibo' },
        //         // { opcion: 'Anular recibo', url: '/registro/gestion/cierre-caja' },
        //         // { opcion: 'Duplicado de recibo', url: '/registro/gestion/cierre-caja' }
        //     ]
        // },
        // {
        //     opcion: 'Analista',
        //     icono: 'mdi mdi-gauge',
        //     submenu: [
        //         // { opcion: 'Ingresos y egresos', url: '/registro/gestion/caja-ingresos-egresos' },
        //         // { opcion: 'Cierre de caja', url: '/registro/gestion/cierre-caja' }
        //         { opcion: 'Registrar Recaudación', url: '/analista/gestion/producto-pre-pago' }
        //     ]
        // }
    ];

    if (rol.includes('Administrador')) {
        // menu[1].submenu.unshift({});
        menu.unshift({
                opcion: 'Seguridad',
                icono: 'mdi mdi-account-key',
                submenu: [
                    { opcion: 'Gestionar Usuarios', url: '/seguridad/gestion/usuario' },
                    // { opcion: 'Roles', url: '/seguridad/gestion/rol' },
                    // { opcion: 'Analistas', url: '/seguridad/gestion/rol' },
                    // { opcion: 'Cajeros', url: '/seguridad/gestion/rol' },
                    { opcion: 'Gestionar Cajas y Cajeros', url: '/seguridad/gestion/caja' },
                    { opcion: 'Gestionar Analistas', url: '/seguridad/gestion/analista' },
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

    if (rol.includes('Administrador') || rol.includes('Analista')) {
        // menu[1].submenu.unshift({});
        menu.push({
            opcion: 'Analista',
            icono: 'mdi mdi-gauge',
            submenu: [
                // { opcion: 'Ingresos y egresos', url: '/registro/gestion/caja-ingresos-egresos' },
                // { opcion: 'Cierre de caja', url: '/registro/gestion/cierre-caja' }
                { opcion: 'Registrar Recaudación', url: '/analista/gestion/producto-pre-pago' }
            ]
        });
    }

    if (rol.includes('Administrador') || rol.includes('Cajero')) {
        // menu[1].submenu.unshift({});
        menu.push({
            opcion: 'Caja',
            icono: 'mdi mdi-cart',
            submenu: [
                { opcion: 'Pagar Producto', url: '/caja/pago/producto-caja' },
                { opcion: 'Pagar Ahorro', url: 'caja/pago/ahorro-caja' },
                // { opcion: 'Confirmar pago de analistas', url: '/caja/pago/confirmar-pago-analista' },
                { opcion: 'Realizar Ingresos - Egresos', url: '/caja/gestion/ingresos-egresos' },
                // { opcion: 'Apertura de caja general', url: '/registro/gestion/cierre-caja' },
                // { opcion: 'Apertura de caja individual', url: '/registro/gestion/cierre-caja' },
                // { opcion: 'Cierre de caja general', url: '/registro/gestion/cierre-caja-general' },
                { opcion: 'Cerrar Caja Individual', url: '/caja/pago/cierre-caja-individual' },
                { opcion: 'Consultar Cajas Individuales', url: '/caja/pago/cajas-lista' },
                { opcion: 'Gestionar Transacciones', url: '/caja/gestion/lista-recibo' },
                // { opcion: 'Anular recibo', url: '/registro/gestion/cierre-caja' },
                // { opcion: 'Duplicado de recibo', url: '/registro/gestion/cierre-caja' }
            ]
        });
    }

    return menu;
}

module.exports = {
    getMenu
}