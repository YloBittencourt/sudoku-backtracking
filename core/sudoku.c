/*
código do slide para se basear:

char * * sudoku(matriz, coords, achou)
    coords_anteriores = coords;
    coords = prox_i_j(matriz, coords_anteriores);
    if(coords fora do intervalo)
        achou = true; return matriz;
    filhos = obtem_filhos(matriz, coords);
    if(filhos.size() == 0)
        matriz[coords_anteriores.i][coords_anteriores.j] = '0';
        return matriz;
    for(k = 0; k < filhos.size(); k++)
        matriz[coords.i][coords.j] = filhos[k];
        matriz = sudoku(matriz, coords, achou);
        if(achou) return matriz;

    matriz[coords_anteriores.i][coords_anteriores.j] = '0';
    return matriz;
*/

#include <stdio.h> 
#include <stdlib.h> 
#include <stdbool.h> 
#include <string.h> 

// Definir tamanho do tabuleiro
#define TAM 9 

// Estrutura de dados para armazenar a posição de uma célula
typedef struct {
    int linha;
    int coluna;
} Posicao;

/*
Função para verificar se um número é palíndromo

Parâmetros:
- seq: vetor de inteiros
- tamanho: tamanho do vetor
*/
bool verificar_palindromo(int seq[], int tamanho) {
    for (int i = 0; i < tamanho / 2; i++) { // Percorre metade do vetor
        if (seq[i] != seq[tamanho - i - 1]) { // Verifica se os elementos simétricos são iguais
            return false; // Se não forem iguais, retorna False
        }
    }
    return true; // Se todos os elementos simétricos forem iguais, retorna True
}

/*
Função para preencher um tabuleiro 3x3 com um palíndromo único na diagonal
Parâmetros:
- tabuleiro: matriz 9x9
- linha_inicial: linha inicial do subtabuleiro 3x3
- coluna_inicial: coluna inicial do subtabuleiro 3x3
- linha: linha atual da diagonal
- diagonal: vetor de inteiros que armazena a diagonal
- tamanho_diagonal: tamanho da diagonal
- contagem_usos: vetor de inteiros que armazena a quantidade de vezes que um número foi usado
- palindromos_existentes: matriz de booleanos que armazena se um palíndromo já foi utilizado
- deslocamento: valor inicial para o deslocamento dos números na diagonal
*/
bool backtracking_diagonal(int tabuleiro[9][9], int linha_inicial, int coluna_inicial, int linha, int diagonal[], int tamanho_diagonal, int contagem_usos[], bool palindromos_existentes[][9], int deslocamento) {
    if (linha == 3) {  // Se completou a diagonal do subtabuleiro 3x3
        if (verificar_palindromo(diagonal, tamanho_diagonal) && !palindromos_existentes[diagonal[0]][diagonal[1]]) { // Verificar se é palíndromo e se a diagonal é única
            palindromos_existentes[diagonal[0]][diagonal[1]] = true;  // Adiciona o palíndromo ao conjunto de existentes
            return true; // Retorna true indicando sucesso
        }
        return false; // Se a diagonal não for palíndromo ou já existir no conjunto, retorna False
    }

    for (int i = 0; i < 9; i++) {  // Garante 9 tentativas, começando do deslocamento (indices de 0 a 8)
        int valor = (i + deslocamento) % 9 + 1;  // Cicla os valores dentro de 1 a 9; exemplo: (0 + 0) % 9 + 1 = 1, (1 + 0) % 9 + 1 = 2, ..., (8 + 0) % 9 + 1 = 9
        if (contagem_usos[valor] < 2) {  // Verifica se o valor já foi usado menos de duas vezes na diagonal (não pode ser um palindromo com 3 números iguais)
            tabuleiro[linha_inicial + linha][coluna_inicial + linha] = valor;  // Coloca o valor na diagonal do subtabuleiro
            contagem_usos[valor] += 1;  // Atualiza o contador de uso do valor
            diagonal[tamanho_diagonal] = valor;  // Adiciona o valor à diagonal
            if (backtracking_diagonal(tabuleiro, linha_inicial, coluna_inicial, linha + 1, diagonal, tamanho_diagonal + 1, contagem_usos, palindromos_existentes, deslocamento)) {
                return true;  // Se um palíndromo válido for encontrado, termina
            }
            tabuleiro[linha_inicial + linha][coluna_inicial + linha] = 0;  // Desfaz a tentativa (backtracking) se não encontrar um palíndromo válido
            contagem_usos[valor] -= 1;  // Restaura o contador
        }
    }

    return false; // Não foi possível formar um palíndromo
}

/*
Função para gerar um tabuleiro 9x9 com um palíndromo único na diagonal
Parâmetros:
- palindromos_existentes: matriz de booleanos que armazena se um palíndromo já foi utilizado
- deslocamento: valor inicial para o deslocamento dos números na diagonal
- tabuleiro: matriz 9x9
*/
void gerar_tabuleiro_com_palindromo_unico_diagonal(bool palindromos_existentes[][9], int deslocamento, int tabuleiro[9][9]) {
    // Inicializa um tabuleiro 9x9 preenchido com zeros
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            tabuleiro[i][j] = 0;
        }
    }

    // Itera sobre os índices dos subtabuleiros 3x3
    for (int i = 0; i < 9; i += 3) {
        for (int j = 0; j < 9; j += 3) {
            int diagonal[3] = {0}; // Inicializa a diagonal
            int contagem_usos[10] = {0}; // Inicializa o contador de uso dos números
            backtracking_diagonal(tabuleiro, i, j, 0, diagonal, 0, contagem_usos, palindromos_existentes, deslocamento); // Chama a função de backtracking
        }
    }
}

/*
Função para verificar se um subtabuleiro 3x3 é válido
Parâmetros:
- tabuleiro: matriz 9x9
- linha_inicio: linha inicial do subtabuleiro 3x3
- coluna_inicio: coluna inicial do subtabuleiro 3x3
- numeros_palindromo: vetor de inteiros que armazena os números do palíndromo
- tamanho_palindromo: tamanho do vetor de palíndromo
*/
bool verificar_restricoes_subtabuleiro_com_diagonal(int tabuleiro[9][9], int linha_inicio, int coluna_inicio, int numeros_palindromo[], int tamanho_palindromo) {
    int contagem[10] = {0};  // Contador de números no subtabuleiro
    int pares_encontrados = 0;  // Conta quantos pares foram criados fora do palíndromo

    // Percorre as linhas
    for (int i = linha_inicio; i < linha_inicio + 3; i++) {
        // Percorre as colunas
        for (int j = coluna_inicio; j < coluna_inicio + 3; j++) {
            int valor = tabuleiro[i][j];  // Para cada célula do subtabuleiro, o valor é extraído e armazenado na variável valor
            bool eh_palindromo = false; // Verifica se o número é um palíndromo
            for (int k = 0; k < tamanho_palindromo; k++) { // Percorre o vetor de palíndromo
                if (valor == numeros_palindromo[k]) {  // Verifica se o número é um palíndromo
                    eh_palindromo = true; // Se for um palíndromo, a variável eh_palindromo recebe True
                    break; 
                }
            }
            if (valor != 0 && !eh_palindromo) {  // Ignora zeros e números do palíndromo para verificar as restrições
                contagem[valor] += 1; // Incrementa o contador para o valor atual
                if (contagem[valor] == 2) {  // Um par encontrado
                    pares_encontrados += 1;
                    // Restrições:
                    if (pares_encontrados > 1) {  // Mais de um par
                        return false;
                    }
                } else if (contagem[valor] > 2) {  // Mais de dois valores iguais
                    return false;
                }
            }
        }
    }
    return true;
}

/*
Função para encontrar a primeira posição vazia em um subtabuleiro 3x3
Parâmetros:
- tabuleiro: matriz 9x9
- linha_inicio: linha inicial do subtabuleiro 3x3
- coluna_inicio: coluna inicial do subtabuleiro 3x3
- numeros_palindromo: vetor de inteiros que armazena os números do palíndromo
- tamanho_palindromo: tamanho do vetor de palíndromo
*/
Posicao encontrar_posicao_vazia(int tabuleiro[9][9], int linha_inicio, int coluna_inicio, int numeros_palindromo[], int tamanho_palindromo) {
    // Inicializa a posição com valores inválidos
    Posicao posicao;
    posicao.linha = -1;
    posicao.coluna = -1;

    // Percorrer linha
    for (int i = linha_inicio; i < linha_inicio + 3; i++) {
        // Percorrer coluna
        for (int j = coluna_inicio; j < coluna_inicio + 3; j++) {
            bool eh_palindromo = false; // Verifica se o número é um palíndromo
            for (int k = 0; k < tamanho_palindromo; k++) { // Percorre o vetor de palíndromo
                if (tabuleiro[i][j] == numeros_palindromo[k]) { // Verifica se o número é um palíndromo
                    eh_palindromo = true; // Se for um palíndromo, a variável eh_palindromo recebe True
                    break;
                }
            }
            if (tabuleiro[i][j] == 0 && i != j && !eh_palindromo) {  // Ignora as células da diagonal principal verificando se é vazia
                posicao.linha = i; 
                posicao.coluna = j;
                return posicao;  // Retorna as coordenadas da célula que está vazia e não está na diagonal
            }
        }
    }
    return posicao;  // Não há posições vazias
}

/*
Função para preencher um subtabuleiro 3x3 com restrições
Parâmetros:
- tabuleiro: matriz 9x9
- linha_inicio: linha inicial do subtabuleiro 3x3
- coluna_inicio: coluna inicial do subtabuleiro 3x3
- numeros_palindromo: vetor de inteiros que armazena os números do palíndromo
- tamanho_palindromo: tamanho do vetor de palíndromo
- par_utilizado: booleano que indica se um par foi utilizado
*/
bool preencher_subtabuleiro_com_restricoes(int tabuleiro[9][9], int linha_inicio, int coluna_inicio, int numeros_palindromo[], int tamanho_palindromo, bool par_utilizado) {
    Posicao posicao = encontrar_posicao_vazia(tabuleiro, linha_inicio, coluna_inicio, numeros_palindromo, tamanho_palindromo);
    if (posicao.linha == -1 && posicao.coluna == -1) {  // Caso base: não há mais posições vazias no subtabuleiro
        return true;
    }

    int linha = posicao.linha;
    int coluna = posicao.coluna;

    for (int valor = 1; valor <= 9; valor++) { // Percorre os valores de 1 a 9
        bool eh_palindromo = false; // Verifica se o número é um palíndromo
        for (int k = 0; k < tamanho_palindromo; k++) { // Percorre o vetor de palíndromo
            if (valor == numeros_palindromo[k]) { // Verifica se o número é um palíndromo
                eh_palindromo = true; // Se for um palíndromo, a variável eh_palindromo recebe True
                break;
            }
        }
        if (!eh_palindromo) {  // Não permite números do palíndromo
            // Verifica se está repetindo o valor
            bool repetindo_par = false;
            for (int i = 0; i < 3; i++) { // Percorre as linhas
                for (int j = 0; j < 3; j++) { // Percorre as colunas
                    if (tabuleiro[linha_inicio + i][coluna_inicio + j] == valor) { 
                        repetindo_par = true; // Se estiver repetindo o valor, a variável repetindo_par recebe True
                        break;
                    }
                }
                if (repetindo_par) break; // Sai do loop porque não é necessário continuar já que o valor já foi encontrado
            }

            // Permite criar um par apenas se ainda não foi criado
            // Serve para evitar que um par seja criado em mais de um subtabuleiro, se for par ele volta para o loop e tenta outro valor
            if (repetindo_par && par_utilizado) { 
                continue; // Pula para a próxima iteração do loop 
            }

            // Coloca o valor na célula (será colocado se o valor não estiver sendo repetido, por que já tem um par)
            tabuleiro[linha][coluna] = valor;

            // Verifica se o subtabuleiro permanece válido
            if (verificar_restricoes_subtabuleiro_com_diagonal(tabuleiro, linha_inicio, coluna_inicio, numeros_palindromo, tamanho_palindromo)) {
                if (preencher_subtabuleiro_com_restricoes(tabuleiro, linha_inicio, coluna_inicio, numeros_palindromo, tamanho_palindromo, par_utilizado || repetindo_par)) {
                    return true;
                }
            }

            // Backtracking: desfaz a tentativa
            tabuleiro[linha][coluna] = 0;
        }
    }

    return false;  // Não foi possível preencher o subtabuleiro
}

// Função para preencher o tabuleiro completo com restrições ajustadas
void preencher_completo_com_restricoes_ajustadas(int tabuleiro[9][9]) {
    for (int linha_inicio = 0; linha_inicio < 9; linha_inicio += 3) { // Percorre as linhas
        for (int coluna_inicio = 0; coluna_inicio < 9; coluna_inicio += 3) { // Percorre as colunas
            // Extrai os números do palíndromo da diagonal principal
            int numeros_palindromo[3]; 
            for (int i = 0; i < 3; i++) { // Percorre a diagonal principal
                numeros_palindromo[i] = tabuleiro[linha_inicio + i][coluna_inicio + i]; // Armazena os números da diagonal principal
            }

            // Preenche o subtabuleiro com as restrições ajustadas
            preencher_subtabuleiro_com_restricoes(tabuleiro, linha_inicio, coluna_inicio, numeros_palindromo, 3, false);
        }
    }
}

// Função para imprimir o tabuleiro
void imprimir(int tabuleiro[9][9]) {
    for (int i = 0; i < 9; i++) {
        if (i > 0 && i % 3 == 0) {
            printf("\n");  // Adiciona uma linha em branco entre os subtabuleiros
        }
        for (int j = 0; j < 9; j++) {
            if (j > 0 && j % 3 == 0) {
                printf(" ");  // Adiciona um espaço em branco entre os subtabuleiros
            }
            printf("%d ", tabuleiro[i][j]);
        }
        printf("\n");
    }
}

int main() {
    printf("-----------------------------------TABULEIRO DO SUDOKU-----------------------------------\n");

    int n;
    printf("Digite o número de tabuleiros 9x9 a serem gerados e preenchidos: ");
    if (scanf("%d", &n) != 1) return 1;

    for (int idx = 0; idx < n; idx++) { // Para gerar tabuleiros diferentes a cada iteração
        // Gera um tabuleiro com palíndromos nas diagonais
        bool palindromos_existentes[9][9] = {false};
        int tabuleiro[9][9] = {0};
        gerar_tabuleiro_com_palindromo_unico_diagonal(palindromos_existentes, idx, tabuleiro);

        printf("------------------------------------------------------------------\n");
        printf("Tabuleiro %d após o primeiro backtracking (palíndromos):\n", idx + 1);
        imprimir(tabuleiro);

        // Preenche o tabuleiro obedecendo às restrições
        preencher_completo_com_restricoes_ajustadas(tabuleiro);

        printf("------------------------------------------------------------------\n");
        printf("Tabuleiro %d após o segundo backtracking (completo):\n", idx + 1);
        imprimir(tabuleiro);
    }

    return 0;
}