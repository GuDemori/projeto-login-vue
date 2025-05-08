<template>
    <div :class="['container', currentClass]">
        <div class="content first-content">
            <div class="first-colunm">
                <h2 class="title title-primary">Bem-vindo</h2>
                <p class="description description-primary">Para permanecer conectado conosco, por favor</p>
                <p class="description description-primary">efetue o login com suas informações pessoais</p>
                <button id="signIn" class="button button-primary" @click="setClass('sign-in')">Acessar</button>
            </div>
            <div class="second-colunm">
                <h2 class="title title-second">Crie sua conta</h2>
                <div class="social-midia">
                    <ul class="list-social-midia">
                        <a href="#" class="link-social-midia">
                            <li class="item-social-midia">
                                <i class="fab fa-facebook-f"></i>
                            </li>
                        </a>
                        <a href="#" class="link-social-midia">
                            <li class="item-social-midia">
                                <i class="fab fa-google"></i>
                            </li>
                        </a>
                        <a href="#" class="link-social-midia">
                            <li class="item-social-midia">
                                <i class="fab fa-linkedin-in"></i>
                            </li>
                        </a>
                    </ul>
                </div>

                <p v-if="error" class="error">{{ error }}</p>

                <p class="description description-second">Ou cadastre-se: </p>
                <form class="form">
                    <label class="label label-input">
                        <i class="fas fa-envelope icons"></i>
                        <input type="email" placeholder="E-mail" v-model="registerData.email"/>
                    </label>
                    <label class="label label-input">
                        <i class="fas fa-lock icons"></i>
                        <input type="password" placeholder="Senha" v-model="registerData.senha"/>
                    </label>
                    <label class="label label-input">
                        <i class="fas fa-lock icons"></i>
                        <input type="password" placeholder="Confirmar senha" v-model="registerData.senhaConfirmada"/>
                    </label>
                    <button id="register" class="button button-second" @click.prevent="handleRegister">Cadastrar</button>
                </form>
            </div>
        </div>

        <div class="content second-content">
            <div class="first-colunm">
                <h2 class="title title-primary">Olá, Bem Vindo!</h2>
                <p class="description description-primary">Faça seu cadastro</p>
                <p class="description description-primary">e começe sua jornada conosco</p>
                <button id="signUp" class="button button-primary" @click="setClass('sign-up')">Cadastrar</button>
            </div>
            <div class="second-colunm">
                <h2 class="title title-second">Acesse com a sua conta</h2>
                <p class="description description-second">ou utilize seu e-mail e senha</p>
                <p v-if="loginError" class="error">{{ loginError }}</p>
                <form class="form" @submit.prevent="handleLogin">
                    <label class="label label-input">
                        <i class="fas fa-envelope icons"></i>
                        <input type="email" placeholder="E-mail" v-model="loginData.email"/>
                    </label>
                    <label class="label label-input">
                        <i class="fas fa-lock icons"></i>
                        <input type="password" placeholder="Senha" v-model="loginData.senha"/>
                    </label>
                    <a href="#" class="description description-second">Esqueceu sua senha?</a>
                    <button id="access" class="button button-second">Acessar</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LoginLayout',
    data() {
        return {
            currentClass: 'on-load',
            error: '',
            loginError: '',

            registerData: {
                email: '',
                senha: '',
                senhaConfirmada: '',
            },

            loginData: {
                email: '',
                senha: '',
            },
        };
    },
    mounted() {
        setTimeout(() => {
            this.currentClass = 'on-load';
        }, 0);
    },
    methods: {
        setClass(newClass) {
            this.currentClass = newClass;
        },

        async handleRegister() {

            this.error = '';

            if (!this.registerValidation()) return;

            if (!(await this.checkEmailExists(this.registerData.email))) return;

            try {
                const response = await fetch('https://umfgcloud-autenticacao-service-7e27ead80532.herokuapp.com/Autenticacao/registar', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.registerData.email,
                        senha: this.registerData.senha,
                        senhaConfirmada: this.registerData.senhaConfirmada
                    })
                });

                if (!response.ok) {
                    const ct = response.headers.get('content-type') || '';
                    if (ct.includes('application/json')) {
                        const payload = await response.json();
                        const firstError =
                        payload.errors.Email?.[0] ||
                        payload.errors.Senha?.[0] ||
                        payload.errors.SenhaConfirmada?.[0];
                        this.error = firstError;
                    } else {
                        const text = await response.text();
                        if (text.includes('is already taken')) {
                        this.error = `O e-mail '${this.registerData.email}' já está em uso.`;
                        } else {
                        this.error = text;
                        }
                    }
                    return;
                }

                alert('Cadastro realizado com sucesso');
            } catch (error) {
                console.error(error);
                alert('Erro na requisição')
            }
        },

        async handleLogin() {
            this.loginError = '';
            if (!this.loginValidation()) return;

            try {
                const response = await fetch(
                'https://umfgcloud-autenticacao-service-7e27ead80532.herokuapp.com/Autenticacao/autenticar',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                    email: this.loginData.email,
                    senha: this.loginData.senha
                    })
                }
                );

                if (!response.ok) {
                const ct = response.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                    const payload = await response.json();
                    this.loginError = payload.errors?.Email?.[0]
                                    || payload.errors?.Senha?.[0]
                                    || 'Erro de validação.';
                } else {
                    const text = await response.text();
                    this.loginError = text;
                }
                return;
                }

                const { token, dataExpiracao } = await response.json();
                localStorage.setItem('token', token);
                alert('Login bem-sucedido! Expira em ' + new Date(dataExpiracao).toLocaleString());
            } catch (err) {
                console.error(err);
                this.loginError = 'Erro na requisição.';
            }
        },


        registerValidation () {
            const { email, senha, senhaConfirmada } = this.registerData;
            const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

            if (!email) {
                this.error = 'Informe o e-mail.';
                return false;
            }
            if (!emailRegex.test(email)) {
                this.error = 'E-mail inválido.';
                return false;
            }
            if (senha.length < 6 || senha.length > 50) {
                this.error = 'Senha deve ter entre 6 e 50 caracteres.';
                return false;
            }
            if (senhaConfirmada !== senha) {
                this.error = 'Senhas não conferem.';
                return false;
            }
                this.error = '';
                return true;
        },

        async checkEmailExists(email) {
            const res = await fetch(
                'https://umfgcloud-autenticacao-service-7e27ead80532.herokuapp.com/Autenticacao/verificarEmail?email='
                + encodeURIComponent(email),
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (!res.ok) {
                return true;
            }
            const { exists } = await res.json();
            if (exists) {
                this.error = 'Este e-mail já está em uso.';
                return false;
            }
            return true;
        },

        loginValidation() {
            const { email, senha } = this.loginData;
            const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

            if (!email) {
                this.loginError = 'Informe o e-mail.';
                return false;
            }
            if (!emailRegex.test(email)) {
                this.loginError = 'E-mail inválido.';
                return false;
            }
            if (!senha) {
                this.loginError = 'Informe a senha.';
                return false;
            }
            this.loginError = '';
            return true;
        },

    }
};
</script>

<style scoped>
@import '../assets/styles.css';
</style>