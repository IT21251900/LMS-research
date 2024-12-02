import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import mermaid from 'mermaid';
import html2canvas from "html2canvas";
import { OPENAI_API_KEY } from '../../../environments/environment';

@Component({
  selector: 'app-simple-mindmap-view',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './simple-mindmap-generator.html',
  styleUrl: './simple-mindmap-generator.scss'
})
export class SimpleMindMapGeneratorComponent implements OnInit{
  prompt: string = '';
  result: string = '';
  model: string = 'gpt-4o-mini';
  token: string = OPENAI_API_KEY;
  maxTokens: number = 2000;
  mermaidString: string | null = null;
  temperature: number = 0.7;
  promptTemplate: string =`Create a mermaid mindmap based on user input like these examples:
brainstorming mindmap
mindmap
\t\troot(("leisure activities weekend"))
\t\t\t\t["spend time with friends"]
\t\t\t\t::icon(fafa fa-users)
\t\t\t\t\t\t("action activities")
\t\t\t\t\t\t::icon(fafa fa-play)
\t\t\t\t\t\t\t\t("dancing at night club")
\t\t\t\t\t\t\t\t("going to a restaurant")
\t\t\t\t\t\t\t\t("go to the theater")
\t\t\t\t["spend time your self"]
\t\t\t\t::icon(fa fa-fa-user)
\t\t\t\t\t\t("meditation")
\t\t\t\t\t\t::icon(fa fa-om)
\t\t\t\t\t\t("\`take a sunbath ☀️\`")
\t\t\t\t\t\t("reading a book")
\t\t\t\t\t\t::icon(fa fa-book)
text summary mindmap:
Barack Obama (born August 4, 1961) is an American politician who served as the 44th president of the United States from 2009 to 2017. A member of the Democratic Party, he was the first African-American president of the United States.
mindmap
\troot("Barack Obama")
\t\t("Born August 4, 1961")
\t\t::icon(fa fa-baby-carriage)
\t\t("American Politician")
\t\t\t::icon(fa fa-flag)
\t\t\t\t("44th President of the United States")
\t\t\t\t\t("2009 - 2017")
\t\t("Democratic Party")
\t\t\t::icon(fa fa-democrat)
\t\t("First African-American President")
cause and effects mindmap:
mindmap
\troot("Landlord sells apartment")
\t\t::icon(fa fa-sell)
\t\t("Renter must be notified of sale")
\t\t::icon(fa fa-envelope)
\t\t\t("Tenants may feel some uncertainty")
\t\t\t::icon(fa fa-question-circle)
\t\t("Notice periods must be observed")
\t\t::icon(fa fa-calendar)
\t\t\t("Landlord can submit notice of termination for personal use")
\t\t\t::icon(fa fa-home)
\t\t\t\t("Tenant has to look for a new apartment")
\t\t\t\t::icon(fa fa-search)
\t\t("New owner")
\t\t::icon(fa fa-user)
\t\t\t\t("New owner takes over existing rental agreement")
\t\t\t\t::icon(fa fa-file-contract)
\t\t\t\t\t\t("Tenant keeps previous apartment")
\t\t\t\t\t\t::icon(fa fa-handshake)
\t\t\t\t("New owner terminates newly concluded lease")
\t\t\t\t::icon(fa fa-ban)
\t\t\t\t\t\t("Tenant has to look for a new apartment")
\t\t\t\t\t\t::icon(fa fa-search)
Only one root, use free FontAwesome icons, and follow node types "[", "(". No need to use "mermaid", "\`\`\`", or "graph TD". Respond only with code and syntax.`


  activeTab: string = 'Mindmapping';
  mindMappingForm!: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder,private cdr: ChangeDetectorRef,) {}

  ngOnInit(): void {
    // Initialize form
    this.mindMappingForm = this.fb.group({
      prompt: [this.prompt],
      result: [this.result]
    });

    // Retrieve saved settings from localStorage (if any)
    this.token = localStorage.getItem('token') || '';
    this.model = localStorage.getItem('model') || this.model;
    this.maxTokens = parseInt(localStorage.getItem('maxTokens') || `${this.maxTokens}`, 10);
    this.temperature = parseFloat(localStorage.getItem('temperature') || `${this.temperature}`);
    this.promptTemplate = localStorage.getItem('promptTemplate') || this.promptTemplate;
  }

  // Method to call OpenAI API
  async callOpenAi() {
    this.result = '';
    
    const url = 'https://api.openai.com/v1/chat/completions';
    const data = {
      model: this.model,
      messages: [
        { role: 'system', content: this.promptTemplate },
        { role: 'user', content: this.prompt }
      ],
      stream: true,
      max_tokens: this.maxTokens,
      temperature: this.temperature
    };

    try {
      const response: any = await this.http.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        observe: 'body',
        responseType: 'text'
      }).toPromise();

      this.handleApiResponse(response);
    } catch (error) {
      console.error('Error calling API:', error);
    }
  }

  // Handling the API response
  handleApiResponse(response: string) {
    const resultString = response.split("\n").reduce((acc, line) => {
      const message = line.replace(/^data: /, '').trim();
      if (message && message !== '[DONE]') {
        try {
          const parsed = JSON.parse(message);
          const result = parsed.choices[0].delta.content || '';
          if (!result.includes('mermaid')) {
            acc += result;
          }
        } catch (error) {
          console.error('Error parsing response:', error);
        }
      }
      return acc;
    }, '');

    this.result = resultString;
    this.mermaidString = this.result;

    console.log(this.result)
    this.renderMermaid();
  }
  
  renderMermaid() {
    mermaid.init(undefined, document.querySelectorAll('.mermaid'));
  }
  

  ngAfterViewChecked() {
    if (this.mermaidString) {
      try {
        const mermaidElement = document.querySelector('.mermaid') as HTMLElement;
        if (mermaidElement) {
          mermaidElement.innerHTML = this.mermaidString;
          
          console.log("Mermaid String:", this.mermaidString);
          this.renderMermaid();
        }
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
      } finally {
        this.mermaidString = null;
        this.cdr.detectChanges();
      }
    }
  }

  async downloadMindMap() {
    const mindMapElement = document.querySelector(".mermaid") as HTMLElement;
    if (mindMapElement) {
      const canvas = await html2canvas(mindMapElement, { useCORS: true });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "mindmap.png";
      link.click();
    } else {
      console.error("Mind map element not found for download.");
    }
}
}
