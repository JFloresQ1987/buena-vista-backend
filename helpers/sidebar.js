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
            opcion: 'Registrar',
            icono: 'mdi mdi-gauge',
            submenu: [
                { opcion: 'Socio', url: '/registro/gestion/socio/0' },
                { opcion: 'Crédito', url: '/registro/gestion/credito' },
                { opcion: 'Ahorro', url: '/registro/gestion/ahorro' }
            ]
        },
        {
            opcion: 'Operaciones',
            icono: 'mdi mdi-gauge',
            submenu: [
                { opcion: 'Productos vigentes', url: '/operaciones/gestion/producto' },
                { opcion: 'Productos históricos', url: '/operaciones/consulta/producto-historico' }
            ]
        },
        {
            opcion: 'Caja',
            icono: 'mdi mdi-gauge',
            submenu: [
                { opcion: 'Ingresos y egresos', url: '/registro/gestion/caja-ingresos-egresos' },
                { opcion: 'Apertura de caja general', url: '/registro/gestion/cierre-caja' },
                { opcion: 'Apertura de caja individual', url: '/registro/gestion/cierre-caja' },
                { opcion: 'Cierre de caja general', url: '/registro/gestion/cierre-caja' },
                { opcion: 'Cierre de caja individual', url: '/registro/gestion/cierre-caja' },
                { opcion: 'Anular recibo', url: '/registro/gestion/cierre-caja' },
                { opcion: 'Duplicado de recibo', url: '/registro/gestion/cierre-caja' }
            ]
        },
        {
            opcion: 'Analista',
            icono: 'mdi mdi-gauge',
            submenu: [
                { opcion: 'Ingresos y egresos', url: '/registro/gestion/caja-ingresos-egresos' },
                { opcion: 'Cierre de caja', url: '/registro/gestion/cierre-caja' }
            ]
        }
    ];

    if (rol.includes('Administrador')) {
        // menu[1].submenu.unshift({});
        menu.unshift({
            opcion: 'Gestionar',
            icono: 'mdi mdi-bullseye',
            submenu: [
                { opcion: 'Usuarios', url: '/seguridad/gestion/usuario' },
                { opcion: 'Roles', url: '/seguridad/gestion/rol' },
                { opcion: 'Analistas', url: '/seguridad/gestion/rol' },
                { opcion: 'Cajeros', url: '/seguridad/gestion/rol' }
            ]
        }, {
            opcion: 'Reportes',
            icono: 'mdi mdi-bullseye',
            submenu: [
                { opcion: 'Diario', url: '/seguridad/gestion/usuario' }
            ]
        });
    }

    return menu;
}

module.exports = {
    getMenu
}