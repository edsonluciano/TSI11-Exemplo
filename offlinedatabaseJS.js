//1. Inicialização

var localDB = null;

function onInit(){
    try {
        if (!window.openDatabase) {
            updateStatus("Erro: Seu navegador não permite banco de dados.");
        }
        else {
            initDB();
            createTables();
            queryAndUpdateOverview();
        }
    } 
    catch (e) {
        if (e == 2) {
            updateStatus("Erro: Versão de banco de dados inválida.");
        }
        else {
            updateStatus("Erro: Erro desconhecido: " + e + ".");
        }
        return;
    }
}

function initDB(){
    var shortName = 'stuffDB';
    var version = '1.0';
    var displayName = 'MyStuffDB';
    var maxSize = 65536; // Em bytes
    localDB = window.openDatabase(shortName, version, displayName, maxSize);
}

function createTables(){
    var query = 'CREATE TABLE IF NOT EXISTS aluno(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome VARCHAR NOT NULL, endereco VARCHAR NOT NULL, email VARCHAR NOT NULL, curso VARCHAR NOT NULL, campus VARCHAR NOT NULL);';
    try {
        localDB.transaction(function(transaction){
            transaction.executeSql(query, [], nullDataHandler, errorHandler);
            updateStatus("Tabela 'aluno' status: OK.");
        });
    } 
    catch (e) {
        updateStatus("Erro: Data base 'aluno' não criada " + e + ".");
        return;
    }
}




//2. Query e visualização de Update


function onUpdate(){
    var id = document.itemForm.id.value;
    var nome = document.itemForm.nome.value;
    var endereco = document.itemForm.endereco.value;
	var email = document.itemForm.email.value;
	var curso = document.itemForm.curso.value;
	var campus = document.itemForm.campus.value;
    if (nome == "" || endereco == "" || email == "" || curso == "") {
        updateStatus("'Nome', 'endereco' e 'e-mail' são campos obrigatórios!");
    }
    else {
        var query = "update aluno set nome=?, endereco=?, email=?, curso=?, campus=? where id=?;";
        try {
            localDB.transaction(function(transaction){
                transaction.executeSql(query, [nome, endereco, email, curso, campus, id], function(transaction, results){
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Update não realizado.");
                    }
                    else {
                        updateForm("", "", "", "");
                        updateStatus("Update realizado:" + results.rowsAffected);
                        queryAndUpdateOverview();
                    }
                }, errorHandler);
            });
        } 
        catch (e) {
            updateStatus("Erro: UPDATE não realizado " + e + ".");
        }
    }
}

function onDelete(){
    var id = document.itemForm.id.value;
    
    var query = "delete from aluno where id=?;";
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [id], function(transaction, results){
                if (!results.rowsAffected) {
                    updateStatus("Erro: Delete não realizado.");
                }
                else {
                    updateForm("", "", "", "");
                    updateStatus("Linhas deletadas:" + results.rowsAffected);
                    queryAndUpdateOverview();
                }
            }, errorHandler);
        });
    } 
    catch (e) {
        updateStatus("Erro: DELETE não realizado " + e + ".");
    }
    
}

function onCreate(){
    var nome = document.itemForm.nome.value;
    var endereco = document.itemForm.endereco.value;
	var email = document.itemForm.email.value;
	var curso = document.itemForm.curso.value;
	var campus = document.itemForm.campus.value;
    if (nome == "" || endereco == "") {
        updateStatus("Erro: 'Nome', 'endereco', 'e-mail' e 'curso' são campos obrigatórios!");
    }
    else {
        var query = "insert into aluno (nome, endereco, email, curso, campus) VALUES (?, ?, ?, ?, ?);";
        try {
            localDB.transaction(function(transaction){
                transaction.executeSql(query, [nome, endereco, email, curso, campus], function(transaction, results){
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Inserção não realizada");
                    }
                    else {
                        updateForm("", "", "");
                        updateStatus("Inserção realizada, linha id: " + results.insertId);
                        queryAndUpdateOverview();
                    }
                }, errorHandler);
            });
        } 
        catch (e) {
            updateStatus("Erro: INSERT não realizado " + e + ".");
        }
    }
}

function onSelect(htmlLIElement){
	var id = htmlLIElement.getAttribute("id");
	
	query = "SELECT * FROM aluno where id=?;";
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [id], function(transaction, results){
            
                var row = results.rows.item(0);
                
                updateForm(row['id'], row['nome'], row['endereco'], row['email'], row['curso'], row['campus']);
                
            }, function(transaction, error){
                updateStatus("Erro: " + error.code + "<br>Mensagem: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: SELECT não realizado " + e + ".");
    }
   
}

function queryAndUpdateOverview(){

	//Remove as linhas existentes para inserção das novas
    var dataRows = document.getElementById("itemData").getElementsByClassName("data");
	
    while (dataRows.length > 0) {
        row = dataRows[0];
        document.getElementById("itemData").removeChild(row);
    };
    
	//Realiza a leitura no banco e cria novas linhas na tabela.
    var query = "SELECT * FROM aluno;";
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [], function(transaction, results){
                for (var i = 0; i < results.rows.length; i++) {
                
                    var row = results.rows.item(i);
                    var li = document.createElement("li");
					li.setAttribute("id", row['id']);
                    li.setAttribute("class", "data");
                    li.setAttribute("onclick", "onSelect(this)");
                    
                    var liText = document.createTextNode(row['nome'] + "  - " + "  Endereço: "+ row['endereco'] + "  - " + "Email: "+ row['email'] + "  - " + " Curso: "+ row['curso'] + "  - " + " Campus: "+ row['campus']);
                    li.appendChild(liText);
                    
                    document.getElementById("itemData").appendChild(li);
                }
            }, function(transaction, error){
                updateStatus("Erro: " + error.code + "<br>Mensagem: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: SELECT não realizado " + e + ".");
    }
}

// 3. Funções de tratamento e status.

// Tratando erros

errorHandler = function(transaction, error){
    updateStatus("Erro: " + error.message);
    return true;
}

nullDataHandler = function(transaction, results){
}

// Funções de update

function updateForm(id, nome, endereco, email, curso){
    document.itemForm.id.value = id;
    document.itemForm.nome.value = nome;
    document.itemForm.endereco.value = endereco;
	document.itemForm.email.value = email;
	document.itemForm.curso.value = curso;
}

function updateStatus(status){
    document.getElementById('status').innerHTML = status;
}