const getMenu = (rol) => {

    const menu = [{
            opcion: 'Home',
            icono: 'mdi mdi-gauge',
            submenu: [
                { opcion: 'Dashboard', url: '/dashboard' }
            ]
        },
        {
            opcion: 'Registro',
            icono: 'mdi mdi-gauge',
            submenu: [
                { opcion: 'Socios', url: '/registro/gestion/socio' },
                { opcion: 'Créditos', url: '/registro/gestion/credito' }
            ]
        }
    ];

    if (rol.includes('Administrador')) {
        // menu[1].submenu.unshift({});
        menu.unshift({
            opcion: 'Gestión',
            icono: 'mdi mdi-bullseye',
            submenu: [
                { opcion: 'Usuarios', url: '/seguridad/gestion/usuario' },
                { opcion: 'Roles', url: '/seguridad/gestion/rol' }
            ]
        });
    }

    return menu;
}

module.exports = {
    getMenu
}