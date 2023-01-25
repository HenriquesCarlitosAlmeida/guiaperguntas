const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");
//  CONFIGURANCAO DE CONEXAO
connection
    .authenticate()
    .then(()=>{
        console.log("Conexao a base De dados  feita com Sucesso");
    })
    .catch((msgErro)=>{
        console.log(msgErro);
    });

// DIZENDO O EXPRESS QUE USAREI EJS COMO VIEW ENGINE
app.set('view engine','ejs');// DIZENDO O EXPRESS O QUE VAI SER RENDERIZADO
app.use(express.static('public')); // DIZENDO AO EXPRESS ONDE FICARAM OS ARQUIVOS ESTATICOS E USALOS
app.use(bodyParser.urlencoded({extended:false})); // PERMITE QUE OS DADOS VINDOS DO FORMULARIO SEJAM TRANSFORMADOS PARA QUE SEJAM TRATADOS EM JS
app.use(bodyParser.json()); // PERRMITE TRABALHAR COM DADOS ENVIADOS VIA JSON

app.get("/",(req,res)=>{
    Pergunta.findAll({raw:true,order:[
        ['id','DESC'] //    INFORMANDO A ORGANIZACAO DOS DADOS(CRECENTE OU DECRECENTE)
    ]}).then(perguntas =>{
        res.render("index",{
            perguntas: perguntas
        });
    }); // BUSCANDO TODOS DADOS NA BD NA TABELA PERGUNTAS   
});
app.get("/perguntar",(req,res)=>{
    res.render("perguntar");
});
app.post("/salvarpergunta",(req,res)=>{
    var titulo = req.body.titulo;
    var descricao = req.body.descricao
    
    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(()=>{
        res.redirect("/");
    }).catch((msgErro)=>{
        console.log("Ocorreu um erro ao inserir os dados: "+msgErro);
    });
});

app.get("/pergunta/:id",(req,res)=>{
    var id = req.params.id;
    Pergunta.findOne({
        where:{
            id:id
        }
    }).then(pergunta => {
        if(pergunta != undefined){ //A PERGUNTA FOI ENCONTRADA
            Resposta.findAll({
                where:{perguntaId:pergunta.id},
                order:[
                        ['id','DESC']
                      ]
            }).then(respostas=>{
                res.render("pergunta",{
                    pergunta:pergunta,
                    respostas: respostas
                });
            })
            
        }else{ // A PERGUNTA NAO FOI ACHADA RETORNANDO UM NULO OU UNDEFINED
            res.redirect("/");
        }
    })
});

app.post("/responder",(req,res)=>{
    const corpo = req.body.corpo;
    const perguntaId = req.body.pergunta;

    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(()=>{
        res.redirect("/pergunta/"+perguntaId);
    });
});

app.get("/carrossel",(req,res)=>{
    res.render("carrossel");
});

app.listen(8080,()=>{console.log("APP rodando")});