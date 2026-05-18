import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../shared/shared.module';

interface SkillCard {
  code: string;
  title: string;
  description: string;
  examples: string[];
  positiveExamples?: string[];
  negativeExamples?: string[];
  strategy: string;
}

interface StrategyCard {
  title: string;
  use: string;
  examples: string;
  points: string[];
  classroomExample: string;
}

@Component({
  selector: 'app-guia-soft-skills',
  standalone: true,
  imports: [CommonModule, MatIconModule, SharedModule],
  templateUrl: './guia-soft-skills.component.html',
  styleUrls: ['./guia-soft-skills.component.scss']
})
export class GuiaSoftSkillsComponent {
  readonly skillCards: SkillCard[] = [
    {
      code: 'ENFOQUE_DISTRACCIONES',
      title: 'Enfoque y concentracion',
      description: 'Mide como maneja el alumno las distracciones durante el trabajo.',
      examples: ['Mirar el movil', 'Hablar con companeros', 'Hacer tareas de otros modulos'],
      strategy: 'Penalizacion por tramos'
    },
    {
      code: 'PUNTUALIDAD',
      title: 'Puntualidad',
      description: 'Mide si el alumno llega y empieza a trabajar a tiempo.',
      examples: ['Llegada tarde', 'Inicio puntual del trabajo', 'Reincorporacion puntual tras una pausa'],
      strategy: 'Penalizacion por tramos'
    },
    {
      code: 'PARTICIPACION',
      title: 'Participacion',
      description: 'Mide la participacion positiva y util del alumno en el aula.',
      examples: ['Intervenir con una aportacion util', 'Ayudar al grupo', 'Proponer una mejora'],
      strategy: 'Acumulacion saturada'
    },
    {
      code: 'AUTONOMIA',
      title: 'Autonomia en el trabajo',
      description: 'Mide la capacidad para avanzar, gestionar bloqueos, consultar recursos y pedir ayuda de forma preparada.',
      examples: [],
      positiveExamples: ['Avanzar de forma independiente', 'Consultar documentacion antes de pedir ayuda', 'Formular una pregunta preparada', 'Dividir un problema en pasos'],
      negativeExamples: ['Preguntar sin intento previo', 'No leer el enunciado', 'Bloqueo pasivo prolongado', 'Dependencia reiterada del profesor'],
      strategy: 'Evidencia mixta'
    }
  ];

  readonly plannedSkills = [
    'Trabajo en equipo',
    'Comunicacion',
    'Responsabilidad',
    'Gestion emocional',
    'Resolucion de problemas',
    'Respeto'
  ];

  readonly sampleFields = [
    'Alumno',
    'Curso',
    'Soft skill',
    'Profesor que la registra',
    'Fecha automatica',
    'Valor positivo o negativo',
    'Nivel leve, normal o significativo',
    'Motivo libre o predefinido'
  ];

  readonly sampleExamples = [
    { value: 'Positiva', skill: 'Participacion', level: 'Normal', text: 'Explica a un companero como resolver un error y ayuda al grupo a avanzar.' },
    { value: 'Negativa', skill: 'Enfoque', level: 'Leve', text: 'Esta mirando el movil durante la explicacion.' },
    { value: 'Positiva', skill: 'Autonomia', level: 'Normal', text: 'Consulta la documentacion, prueba una solucion y despues formula una pregunta concreta.' },
    { value: 'Negativa', skill: 'Autonomia', level: 'Significativa', text: 'Depende de instrucciones paso a paso de forma reiterada en una tarea ya explicada.' },
    { value: 'Negativa', skill: 'Puntualidad', level: 'Normal', text: 'Llega tarde al inicio de la clase.' }
  ];

  readonly positiveReasons = [
    'Avanza de forma independiente',
    'Resuelve bloqueo consultando recursos',
    'Formula pregunta preparada',
    'Comunica bloqueo a tiempo',
    'Aplica una pista y continua',
    'Divide el problema en pasos'
  ];

  readonly negativeReasons = [
    'Pregunta sin intento previo',
    'No lee el enunciado o documentacion',
    'Bloqueo pasivo prolongado',
    'No comunica dificultades',
    'Dependencia reiterada del profesor',
    'Repite pregunta ya resuelta sin aplicar indicaciones'
  ];

  readonly strategies: StrategyCard[] = [
    {
      title: 'Penalizacion por tramos',
      use: 'Para conductas que se esperan por defecto.',
      examples: 'Puntualidad, concentracion y respeto de normas.',
      points: [
        'La puntuacion parte de 10.',
        'Las muestras negativas bajan la puntuacion.',
        'Las muestras positivas pueden recuperarla hasta 10.',
        'Un patron repetido pesa mas que una incidencia aislada.'
      ],
      classroomExample: 'Un retraso puntual apenas afecta. Si un alumno acumula muchas muestras negativas de puntualidad, la penalizacion sera mayor.'
    },
    {
      title: 'Acumulacion saturada',
      use: 'Para competencias que se demuestran con aportaciones positivas.',
      examples: 'Participacion, iniciativa y ayuda al grupo.',
      points: [
        'La puntuacion parte de 0.',
        'Las muestras positivas suman evidencia.',
        'Las primeras evidencias suben la puntuacion mas rapido.',
        'Cerca del 10 hace falta mas consistencia para seguir subiendo.',
        'Las muestras negativas quedan registradas como incidencias, pero no bajan directamente.'
      ],
      classroomExample: 'Participar una vez ayuda, pero para acercarse a la excelencia hace falta participar de forma consistente y util.'
    },
    {
      title: 'Evidencia mixta',
      use: 'Para competencias que no deben darse por dominadas ni por ausentes.',
      examples: 'Autonomia, responsabilidad, comunicacion profesional y resolucion de problemas.',
      points: [
        'La puntuacion parte de una zona neutra, 5 sobre 10.',
        'Las muestras positivas suben la puntuacion.',
        'Las muestras negativas la bajan.',
        'El nivel de la muestra determina el impacto.',
        'Las incidencias negativas pesan algo mas que las positivas equivalentes.'
      ],
      classroomExample: 'Un alumno que no pregunta nunca no tiene automaticamente un 10 en autonomia: puede ser autonomo o estar bloqueado en silencio.'
    }
  ];

  readonly teacherFlow = [
    'Accede con su usuario',
    'Selecciona un curso',
    'Ve los alumnos del curso',
    'Elige un alumno y una soft skill',
    'Registra una muestra positiva o negativa',
    'Selecciona un motivo o escribe un comentario',
    'La app recalcula la puntuacion',
    'Los resumenes se actualizan'
  ];

  readonly summaryItems = [
    'Puntuacion por soft skill',
    'Numero total de muestras',
    'Detalle historico de muestras',
    'Muestras agrupadas por curso',
    'Ranking o posicion dentro del grupo',
    'Score global como media ponderada'
  ];

  readonly glossary = [
    { term: 'Muestra', definition: 'Observacion concreta sobre una conducta relacionada con una soft skill.' },
    { term: 'Motivo', definition: 'Razon elegida o escrita para explicar por que se registra la muestra.' },
    { term: 'Nivel', definition: 'Intensidad del impacto: leve, normal o significativa.' },
    { term: 'Valor', definition: 'Indica si la muestra suma evidencia positiva o registra una incidencia negativa.' },
    { term: 'Incidencia', definition: 'Muestra negativa que senala una conducta a mejorar.' },
    { term: 'Puntuacion', definition: 'Resultado calculado por la app para cada soft skill.' }
  ];

  readonly goodSamples = [
    'Concreta',
    'Observable',
    'Relacionada con una soft skill',
    'Escrita con lenguaje claro',
    'Registrada cerca del momento en que ocurre',
    'Centrada en conductas, no en juicios personales'
  ];

  readonly goodExamples = [
    'Consulta la documentacion antes de pedir ayuda y explica que ha probado.',
    'Llega tarde por tercera vez esta semana.',
    'Ayuda a un companero a entender el error sin darle directamente la solucion.'
  ];

  readonly badExamples = [
    'Es irresponsable.',
    'Siempre esta distraido.',
    'No vale para trabajar solo.'
  ];
}
