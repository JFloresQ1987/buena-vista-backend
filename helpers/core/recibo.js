const getRecibo = (data) => {
  data.institucion = "Buenavista La Bolsa S.A.C.";
  // data.agencia = 'Agencia Ayacucho';
  data.ruc = "20574744599";
  // data.impresion = 'Original';

  let recibo = [
    [
      {
        content: data.institucion,
        colSpan: 3,
        styles: { halign: "center" },
      },
    ],
    [
      {
        content: data.agencia,
        colSpan: 3,
        styles: { halign: "center" },
      },
    ],
    [
      {
        content: "------------------------------------",
        colSpan: 3,
        styles: { halign: "center" },
      },
    ],
    [
      {
        content: "RUC: " + data.ruc,
        colSpan: 1,
        styles: { halign: "left" },
      },
      {
        content: "",
        colSpan: 1,
      },
      {
        content: data.numero_recibo,
        colSpan: 1,
        styles: { halign: "right" },
      },
    ],
    [],
  ];

  if (data.concepto) {
    recibo.push(
      [
        {
          content: "DNI: " + data.documento_identidad_responsable,
          colSpan: 3,
          styles: { halign: "left" },
        },
      ],
      [
        {
          content: "Responsable: " + data.nombres_apellidos_responsable,
          colSpan: 3,
          styles: { halign: "left" },
        },
      ],
      [],
      [
        {
          content: "Operaciones en Soles",
          colSpan: 3,
          styles: { halign: "left" },
        },
      ],
      [
        {
          content: "------------------------------------",
          colSpan: 3,
          styles: { halign: "center" },
        },
      ],
      [
        {
          content: "Detalle Operación",
          colSpan: 2,
          styles: { halign: "center" },
        },
        {
          content: "Monto",
          colSpan: 1,
          styles: { halign: "right" },
        },
      ],
      [
        {
          content: "------------------------------------",
          colSpan: 3,
          styles: { halign: "center" },
        },
      ],
      [
        {
          content: data.concepto,
          colSpan: 2,
          styles: { halign: "left" },
        },
        {
          content: data.monto_total.toFixed(2),
          colSpan: 1,
          styles: { halign: "right" },
        },
      ]
    );
  } else {
    recibo.push(
      [
        {
          content: "DNI: " + data.documento_identidad_socio,
          colSpan: 3,
          styles: { halign: "left" },
        },
      ],
      [
        {
          content: "Socio: " + data.nombres_apellidos_socio,
          colSpan: 3,
          styles: { halign: "left" },
        },
      ],
      [
        {
          content: "Analista: " + data.nombres_apellidos_analista,
          colSpan: 3,
          styles: { halign: "left" },
        },
      ],
      [
        {
          content: "Producto: " + data.producto,
          colSpan: 3,
          styles: { halign: "left" },
        },
      ],
      [],
      [
        {
          content: "Operaciones en Soles",
          colSpan: 3,
          styles: { halign: "left" },
        },
      ],
      [
        {
          content: "------------------------------------",
          colSpan: 3,
          styles: { halign: "center" },
        },
      ],
      [
        {
          content: "Detalle Operación",
          colSpan: 2,
          styles: { halign: "center" },
        },
        {
          content: "Monto",
          colSpan: 1,
          styles: { halign: "right" },
        },
      ],
      [
        {
          content: "------------------------------------",
          colSpan: 3,
          styles: { halign: "center" },
        },
      ]
    );
  }

  if (data.monto_total_amortizacion_capital > 0)
    recibo.push([
      {
        content: "Amortización Capital",
        colSpan: 2,
        styles: { halign: "left" },
      },
      {
        content: data.monto_total_amortizacion_capital.toFixed(2),
        colSpan: 1,
        styles: { halign: "right" },
      },
    ]);

  if (data.monto_total_interes > 0)
    recibo.push([
      {
        content: "Interés",
        colSpan: 2,
        styles: { halign: "left" },
      },
      {
        content: data.monto_total_interes.toFixed(2),
        colSpan: 1,
        styles: { halign: "right" },
      },
    ]);

  if (data.monto_total_ahorro_programado > 0)
    recibo.push([
      {
        content: "Ahorro Programado",
        colSpan: 2,
        styles: { halign: "left" },
      },
      {
        content: data.monto_total_ahorro_programado.toFixed(2),
        colSpan: 1,
        styles: { halign: "right" },
      },
    ]);

  if (data.monto_total_ahorro_voluntario > 0)
    recibo.push([
      {
        content: "Ahorro Voluntario",
        colSpan: 2,
        styles: { halign: "left" },
      },
      {
        content: data.monto_total_ahorro_voluntario.toFixed(2),
        colSpan: 1,
        styles: { halign: "right" },
      },
    ]);

  if (data.monto_total_mora > 0)
    recibo.push([
      {
        content: "Mora",
        colSpan: 2,
        styles: { halign: "left" },
      },
      {
        content: data.monto_total_mora.toFixed(2),
        colSpan: 1,
        styles: { halign: "right" },
      },
    ]);

  if (data.monto_total_ahorro_inicial > 0)
    recibo.push([
      {
        content: "Ahorro Inicial",
        colSpan: 2,
        styles: { halign: "left" },
      },
      {
        content: data.monto_total_ahorro_inicial.toFixed(2),
        colSpan: 1,
        styles: { halign: "right" },
      },
    ]);

  if (data.monto_total_gasto > 0)
    recibo.push([
      {
        content: "Gasto Administrativo",
        colSpan: 2,
        styles: { halign: "left" },
      },
      {
        content: data.monto_total_gasto.toFixed(2),
        colSpan: 1,
        styles: { halign: "right" },
      },
    ]);

  recibo.push([
    {
      content: "------------------------------------",
      colSpan: 3,
      styles: { halign: "center" },
    },
  ]);

  recibo.push([
    {
      content: "Total: S/.",
      colSpan: 2,
      styles: { halign: "center" },
    },
    {
      content: (Math.round(data.monto_total * 10) / 10).toFixed(2),
      colSpan: 1,
      styles: { halign: "right" },
    },
  ]);

  recibo.push([]);

  recibo.push([
    {
      content: "Usuario: " + data.usuario,
      colSpan: 3,
      styles: { halign: "left" },
    },
  ]);

  recibo.push([
    {
      content: "Fecha: " + data.fecha_recibo,
      colSpan: 3,
      styles: { halign: "left" },
    },
  ]);

  recibo.push([
    {
      content: "Recibo: " + data.impresion,
      colSpan: 3,
      styles: { halign: "left" },
    },
  ]);

  recibo.push([
    {
      content: "** " + data.frase + " **",
      colSpan: 3,
      styles: { halign: "center" },
    },
  ]);

  return recibo;
};

module.exports = {
  getRecibo,
};
