### Ejemplo de query

```json
{
    "_id" : "5e7d2fb18fe0e0cde9ed6076",
    "nombre" : "prestacion",
    "coleccion" : "prestaciones",
    "query" : [ 
        {
            "!match" : {
                "#paciente" : true
            }
        }, 
        {
            "!project" : {
                "paciente_nombre" : "$paciente.nombre",
                "paciente_apellido" : "$paciente.apellido",
                "paciente_documento" : "$paciente.documento"
            }
        }
    ],
    "argumentos" : [ 
        {
            "key" : "paciente",
            "tipo" : "string",
            "required" : true,
            "subquery" : {
                "paciente.id" : "#paciente"
            }
        }
    ],
    "mapping" : [ 
        {
            "columnName" : "paciente_documento",
            "target" : "nacion",
            "source" : "internacion"
        }
    ]
}
```


```json
{
    "_id" : "5e7d2fb18fe0e0cde9ed6076",
    "nombre" : "prestacion",
    "coleccion" : "prestaciones",
    "query" : [ 
        {
            "!match" : {
                "paciente.id" : "#paciente"
            }
        }, 
        {
            "!project" : {
                "paciente_nombre" : "$paciente.nombre",
                "paciente_apellido" : "$paciente.apellido",
                "paciente_documento" : "$paciente.documento"
            }
        }
    ],
    "argumentos" : [ 
        {
            "key" : "paciente",
            "tipo" : "string",
            "required" : true,
        }
    ],
    "mapping" : []
}
```

Por una limitación de mongo los operadores del pipeline deben ser guardados con __!__ y no con el signo __$__.