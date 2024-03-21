const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors()); 

let notificacoes = [];


function loadNotificacoes() {
    fs.readFile('notificacao.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler arquivo JSON:', err);
            return;
        }
        try {
            notificacoes = JSON.parse(data);
        } catch (error) {
            console.error('Erro ao analisar dados do arquivo JSON:', error);
        }
    });
}

// Chama a função para carregar as notificações ao iniciar o servidor
loadNotificacoes();

app.post('/notificacoes', (req, res) => {
    const newNotificacoes = req.body;

    if (!Array.isArray(newNotificacoes)) {
        return res.status(400).send('As notificações devem ser fornecidas como um array');
    }
    
    const lastId = notificacoes.length > 0 ? notificacoes[notificacoes.length - 1].id : 0;

    newNotificacoes.forEach((notificacao, index) => {
        notificacao.id = lastId + index + 1;
    });

    notificacoes.push(...newNotificacoes)

    // Salva os dados atualizados de volta no arquivo JSON
    fs.writeFile('notificacao.json', JSON.stringify(notificacoes), (err) => {
        if (err) {
            console.error('Erro ao salvar dados no arquivo JSON:', err);
            res.status(500).send('Erro interno do servidor');
            return;
        }
        console.log('Dados salvos com sucesso no arquivo JSON');
        res.status(200).send('Usuários adicionados com sucesso');
    });
});

// Rota GET para obter todas as notificações
app.get('/notificacoes', (req, res) => {
    res.json(notificacoes);
});

// Rota GET para obter uma notificação específica por ID
app.get('/notificacoes/:id', (req, res) => {
    const notificacaoId = parseInt(req.params.id);
    const notificacao = notificacoes.find(notificacao => notificacao.id === notificacaoId);
    if (!notificacao) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }
    res.json(notificacao);
});


app.put('/notificacoes/:id', (req, res) => {
    const notificacaoId = parseInt(req.params.id);
    const updatenotificacao = req.body;

    // Encontra o índice do usuário a ser atualizado
    const notificacaoIndex = notificacoes.findIndex(notificacao => notificacao.id === notificacaoId);

    if (notificacaoIndex === -1) {
        return res.status(404).send('Usuário não encontrado');
    }

    // Atualiza o usuário com os novos dados
    notificacoes[notificacaoIndex] = { ...notificacoes[notificacaoIndex], ...updatenotificacao };

    // Salva os dados atualizados de volta no arquivo JSON
    fs.writeFile('/notificacao.json', JSON.stringify(notificacoes), (err) => {
        if (err) {
            console.error('Erro ao salvar dados no arquivo JSON:', err);
            res.status(500).send('Erro interno do servidor');
            return;
        }
        console.log('Dados salvos com sucesso no arquivo JSON');
        res.status(200).send('Usuário atualizado com sucesso');
    });
});

app.delete('/notificacoes/:id', (req, res) => {
    const notificacaoId = parseInt(req.params.id); // Convertendo o ID para um número inteiro

    // Filtra os usuários, mantendo apenas aqueles com IDs diferentes do ID fornecido na solicitação
    notificacoes = notificacoes.filter(notificacao => notificacao.id !== notificacaoId);
     // Cria um conjunto para armazenar IDs únicos
     const uniqueIds = new Set();

     // Filtra as notificações, adicionando os IDs únicos ao conjunto
     const uniqueNotificacoes = notificacoes.filter(notificacao => {
         if (!uniqueIds.has(notificacao.id)) {
             uniqueIds.add(notificacao.id);
             return true;
         }
         return false;
     });

    fs.writeFile('notificacao.json', JSON.stringify(notificacoes), (err) => {
        if (err) {
            console.error('Erro ao salvar dados no arquivo JSON:', err);
            res.status(500).send('Erro interno do servidor');
            return;
        }
        console.log('Dados salvos com sucesso no arquivo JSON');
        res.status(200).send('Usuário removido com sucesso');
    });
});

app.delete('/notificacoes', (req, res) => {
    notificacoes = []; // Remove todas as notificações

    // Salva os dados atualizados de volta no arquivo JSON
    fs.writeFile('notificacao.json', JSON.stringify(notificacoes), (err) => {
        if (err) {
            console.error('Erro ao salvar dados no arquivo JSON:', err);
            res.status(500).send('Erro interno do servidor');
            return;
        }
        console.log('Todas as notificações foram removidas com sucesso do arquivo JSON');
        res.status(200).send('Todas as notificações foram removidas com sucesso');
    });
});
app.listen(PORT, () => {
    console.log(`Servido rodando na porta ${PORT}`);
});


