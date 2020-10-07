# pdf-tp-dicom

Microservicio para transformar un archivo pdf y metadata en un DICOM. Util para agrear el informe de la placa hecha por el médico al PACS.

### Desarrollo

```bash
docker build --tag http-pdf2dcm .
docker run --rm -p 8080:8080 -i -t http-pdf2dcm
```

### Usage

```bash
docker run --rm -p 8080:8080 -i -t andesnqn/pdf2dcm
```

Ejemplo con cUrl:

```bash
curl --location --request POST 'http://localhost:8080/pdf-to-dicom' \
--form 'file=@/home/mbotta/Descargas/consulta-de-enfermeria-29-09-2020-110132.pdf' \
--form 'documento=34934522'
```