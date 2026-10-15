// ============================================
// CLASES DE LÓGICA (Tu código original mejorado con getters)
// ============================================

class Arma {
    constructor(private nombre: string, private danio: number) {}

    atacar(): void {
        console.log(`⚔️ Ataque con ${this.nombre}: ${this.danio} puntos de daño`);
    }

    getDanio(): number { return this.danio; }
    getNombre(): string { return this.nombre; }
}

class Habilidad {
    constructor(private nombre: string, private poder: number) {}

    usar(): void {
        console.log(`✨ Se utiliza ${this.nombre}: ${this.poder} puntos de poder`);
    }

    getNombre(): string { return this.nombre; }
    getPoder(): number { return this.poder; }
}

class Personaje {
    constructor(
        private nombre: string,
        private vida: number,
        private vidaMaxima: number,
        private arma: Arma,
        private habilidad: Habilidad
    ) {}

    atacar(): string {
        return `${this.nombre} ataca con ${this.arma.getNombre()} causando ${this.arma.getDanio()} de daño.`;
    }

    usarHabilidad(): string {
        return `${this.nombre} utiliza ${this.habilidad.getNombre()} recuperando/protigiendo ${this.habilidad.getPoder()} puntos.`;
        
    }

    cambiarArma(nuevaArma: Arma): string {
        this.arma = nuevaArma;
        return `${this.nombre} ahora utiliza ${nuevaArma.getNombre()}.`;
    }

    recibirDanio(danio: number): string {
        this.vida = Math.max(0, this.vida - danio);
        if(this.vida > 0){
        return `${this.nombre} recibió ${danio} puntos de daño. Vida restante: ${this.vida}`;
        }else{
            return `Perdiste, ya no tienes vida`;
        }
        return '';
    }

    // Getters necesarios para la UI
    getNombre(): string { return this.nombre; }
    getVida(): number { return this.vida; }
    getVidaMaxima(): number { return this.vidaMaxima; }
    getArma(): Arma { return this.arma; }
    getHabilidad(): Habilidad { return this.habilidad; }
}

// ============================================
// CONTROLADOR GRÁFICO (UI)
// ============================================

class GameUI {
    
    private personaje: Personaje;
    private armasDisponibles: Arma[];
    
    // Elementos del DOM
    private charName: HTMLElement;
    private healthBar: HTMLElement;
    private healthText: HTMLElement;
    private weaponName: HTMLElement;
    private weaponDamage: HTMLElement;
    private abilityName: HTMLElement;
    private abilityPower: HTMLElement;
    private battleLog: HTMLElement;
    private characterCard: HTMLElement;
    public btnAtacar;
    public btnHabilidad;
    public btnCambio;
    public btnRecibirDaño;
    

    constructor(personaje: Personaje, armasDisponibles: Arma[]) {
        this.personaje = personaje;
        this.armasDisponibles = armasDisponibles;

        // Mapeo de elementos HTML
        this.charName = document.getElementById('char-name')!;
        this.healthBar = document.getElementById('health-bar')!;
        this.healthText = document.getElementById('health-text')!;
        this.weaponName = document.getElementById('weapon-name')!;
        this.weaponDamage = document.getElementById('weapon-damage')!;
        this.abilityName = document.getElementById('ability-name')!;
        this.abilityPower = document.getElementById('ability-power')!;
        this.battleLog = document.getElementById('battle-log')!;
        this.characterCard = document.getElementById('character-card')!;
        this.btnAtacar = document.getElementById('btn-atacar') as HTMLButtonElement;
        this.btnHabilidad = document.getElementById('btn-habilidad') as HTMLButtonElement;
        this.btnCambio = document.getElementById('btn-cambiar-arma') as HTMLButtonElement;
        this.btnRecibirDaño = document.getElementById('btn-recibir-danio') as HTMLButtonElement;

        this.actualizarUI();
        this.asignarEventos();
    }

    private actualizarUI(): void {
        this.charName.textContent = this.personaje.getNombre();
        if(this.personaje.getVida() <= 0){
            this.btnAtacar.disabled = true;
            this.btnCambio.disabled = true;
            this.btnHabilidad.disabled = true;
            this.btnRecibirDaño.disabled = true;
        }
        // Actualizar barra de vida
        const vida = this.personaje.getVida();
        const vidaMax = this.personaje.getVidaMaxima();
        const porcentaje = (vida / vidaMax) * 100;
        
        this.healthBar.style.width = `${porcentaje}%`;
        this.healthText.textContent = `${vida}/${vidaMax}`;
        
        // Cambiar color de la barra si la vida es baja
        this.healthBar.style.backgroundColor = porcentaje < 30 ? '#f44336' : '#4caf50';

        // Actualizar equipo
        const arma = this.personaje.getArma();
        this.weaponName.textContent = arma.getNombre();
        this.weaponDamage.textContent = `${arma.getDanio()} de daño`;

        const habilidad = this.personaje.getHabilidad();
        this.abilityName.textContent = habilidad.getNombre();
        this.abilityPower.textContent = `${habilidad.getPoder()} de poder`;
    
    }

    private agregarLog(mensaje: string): void {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `> ${mensaje}`;
        this.battleLog.appendChild(entry);
        this.battleLog.scrollTop = this.battleLog.scrollHeight; // Auto-scroll
    }

    private animarDanio(): void {
        this.characterCard.classList.add('shake');
        setTimeout(() => this.characterCard.classList.remove('shake'), 500);
    }

    
    private asignarEventos(): void {
        document.getElementById('btn-atacar')!.addEventListener('click', () => {
            const mensaje = this.personaje.atacar();
            this.agregarLog(mensaje);
        });

        document.getElementById('btn-habilidad')!.addEventListener('click', () => {
            const mensaje = this.personaje.usarHabilidad();
            this.agregarLog(mensaje);
        });

        document.getElementById('btn-recibir-danio')!.addEventListener('click', () => {
            const mensaje = this.personaje.recibirDanio(20);
            this.agregarLog(mensaje);
            this.animarDanio(); // Efecto visual de golpe
            this.actualizarUI();
        });

        document.getElementById('btn-cambiar-arma')!.addEventListener('click', () => {
            // Ciclo gráfico entre las armas disponibles
            const armaActual = this.personaje.getArma();
            const indiceActual = this.armasDisponibles.findIndex(a => a.getNombre() === armaActual.getNombre());
            const siguienteIndice = (indiceActual + 1) % this.armasDisponibles.length;
            const nuevaArma = this.armasDisponibles[siguienteIndice];

            const mensaje = this.personaje.cambiarArma(nuevaArma);
            this.agregarLog(mensaje);
            this.actualizarUI(); // ¡Aquí sucede el cambio gráfico!
        });
    }
}

// ============================================
// INICIALIZACIÓN DEL JUEGO
// ============================================

const espada = new Arma("Espada de fuego", 30);
const arco = new Arma("Arco mágico", 20);
const daga = new Arma("Daga de sombra", 15);

const curacion = new Habilidad("Curación", 25);
const escudo = new Habilidad("Escudo mágico", 15);

// Creamos al personaje (Nota: agregué 'vidaMaxima' para la barra de porcentaje)
const guerrero = new Personaje("Guerrero", 100, 100, espada, curacion);

// Inicializamos la interfaz gráfica
const ui = new GameUI(guerrero, [espada, arco, daga]);

ui.agregarLog("¡Bienvenido! Tu personaje está listo para la acción.");