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
                        <input type="email" placeholder="E-mail" v-model="registerData.email" />
                    </label>
                    <label class="label label-input">
                        <i class="fas fa-lock icons"></i>
                        <input type="password" placeholder="Senha" v-model="registerData.senha" />
                    </label>
                    <label class="label label-input">
                        <i class="fas fa-lock icons"></i>
                        <input type="password" placeholder="Confirmar senha" v-model="registerData.senhaConfirmada" />
                    </label>
                    <button id="register" class="button button-second"
                        @click.prevent="handleRegister">Cadastrar</button>
                </form>
            </div>
        </div>

        <div class="content second-content">
            <div class="first-colunm">
                <h2 class="title title-primary">Olá, Bem Vindo!</h2>
                <p class="description description-primary">Faça seu cadastro</p>
                <p class="description description-primary">para começar uma nova vida</p>
                <button id="signUp" class="button button-primary" @click="setClass('sign-up')">Cadastrar</button>
            </div>
            <div class="second-colunm">
                <h2 class="title title-second">Acesse com a sua conta</h2>
                <p class="description description-second">ou utilize seu e-mail e senha</p>
                <p v-if="loginError" class="error">{{ loginError }}</p>
                <form class="form" @submit.prevent="handleLogin">
                    <label class="label label-input">
                        <i class="fas fa-envelope icons"></i>
                        <input type="email" placeholder="E-mail" v-model="loginData.email" />
                    </label>
                    <label class="label label-input">
                        <i class="fas fa-lock icons"></i>
                        <input type="password" placeholder="Senha" v-model="loginData.senha" />
                    </label>
                    <a href="#" class="description description-second">Esqueceu sua senha?</a>
                    <button id="access" class="button button-second">Acessar</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { toast } from 'vue3-toastify'

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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.registerData)
                });

                if (!response.ok) {
                    const ct = response.headers.get('content-type') || '';
                    if (ct.includes('application/json')) {
                        const payload = await response.json();
                        const rawError = payload.errors?.Senha?.join(',') || '';
                        const translatedErrors = [
                            { match: 'non alphanumeric character', msg: 'A senha deve conter pelo menos um caractere especial.' },
                            { match: 'digit', msg: 'A senha deve conter pelo menos um número.' },
                            { match: 'uppercase', msg: 'A senha deve conter pelo menos uma letra maiúscula.' }
                        ];
                        this.error = rawError
                            .split(',')
                            .map(err => {
                                const match = translatedErrors.find(e => err.includes(e.match));
                                return match ? match.msg : err;
                            })
                            .join(' | ');
                    } else {
                        const text = await response.text();
                        this.error = text.includes('is already taken')
                            ? `O e-mail '${this.registerData.email}' já está em uso.`
                            : text;
                    }
                    toast.error(this.error);
                    return;
                }

                toast.success('Cadastro realizado com sucesso!');
            } catch (error) {
                console.error(error);
                toast.error('Erro na requisição');
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
                        body: JSON.stringify(this.loginData)
                    }
                );

                if (!response.ok) {
                    const ct = response.headers.get('content-type') || '';
                    if (ct.includes('application/json')) {
                        const payload = await response.json();
                        this.loginError = payload.errors?.Email?.[0] || payload.errors?.Senha?.[0] || 'Erro de validação.';
                    } else {
                        const text = await response.text();
                        this.loginError = text;
                    }
                    toast.error(this.loginError);
                    return;
                }

                const { token, dataExpiracao } = await response.json();
                localStorage.setItem('token', token);
                toast.success(`Login bem-sucedido! Expira em ${new Date(dataExpiracao).toLocaleString()}`);
                this.$router.push('/welcome')
            } catch (err) {
                console.error(err);
                toast.error('Erro na requisição.');
            }
        },

        registerValidation() {
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
            try {
                const res = await fetch(
                    'https://umfgcloud-autenticacao-service-7e27ead80532.herokuapp.com/Autenticacao/verificarEmail?email=' + encodeURIComponent(email),
                    { headers: { 'Content-Type': 'application/json' } }
                );
                if (!res.ok) return true;

                const { exists } = await res.json();
                if (exists) {
                    this.error = 'Este e-mail já está em uso.';
                    toast.error(this.error);
                    return false;
                }
                return true;
            } catch {
                return true;
            }
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
        }
    }
};
</script>


<style scoped>
@import '../assets/styles.css';
</style>