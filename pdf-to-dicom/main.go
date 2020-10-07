package main


import (
        "fmt"
        "net/http"
        "os/exec"
        "io/ioutil"
        "io"
        "os"
        "log"
        "github.com/gorilla/mux"
)

func UploadFile(w http.ResponseWriter, r *http.Request) { 
    file, handler, err := r.FormFile("file")
    documento := r.FormValue("documento")
    if err != nil {
        panic(err)
    }
    defer file.Close()


    log.Print("Ejemplo parametro extra " + documento) 

    tmpfileDCM, err := ioutil.TempFile("", "")
	if err != nil {
        log.Fatal(err)
        return 
	}
    defer os.Remove(tmpfileDCM.Name()) // clean up

    tmpfilePDF, err := ioutil.TempFile("", "")
	if err != nil {
        log.Fatal(err)
        return 
	}
    defer os.Remove(tmpfilePDF.Name()) // clean up


    io.Copy(tmpfilePDF, file)
    defer tmpfilePDF.Close()

    
    log.Print("real pdf name " + handler.Filename)    
    log.Print("Temp input " + tmpfilePDF.Name())
    log.Print("Temp output " + tmpfileDCM.Name())
 

    dcmCmd := exec.Command("pdf2dcm", tmpfilePDF.Name(), tmpfileDCM.Name())
    dcmOut, err := dcmCmd.Output()
    if err != nil {
            fmt.Fprintf(w,"Problema para ejecutar comando pdf2dcm" + err.Error())
            return
    }
    fmt.Println(string(dcmOut) + " cmd ok");

    io.Copy(w, tmpfileDCM)
    if err!=nil {
        fmt.Fprintf(w,"Problema para enviar archivo "+err.Error())
        return
    }

    defer tmpfileDCM.Close(); 
    defer os.Remove(tmpfileDCM.Name()) 
    defer os.Remove(tmpfilePDF.Name())  


}


func main() {
    router := mux.NewRouter().StrictSlash(true)
    fmt.Println("Server running")
    // router.HandleFunc("/", homeLink)
    router.HandleFunc("/pdf-to-dicom", UploadFile).Methods("POST")
    http.ListenAndServe(":8080", router)
}