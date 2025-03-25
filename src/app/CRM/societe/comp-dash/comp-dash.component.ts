import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';
import { KanbanCompService } from '../../../services/kanban-comp.service';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { MessageService } from 'primeng/api';
import { MatDialog } from '@angular/material/dialog';

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { MatTableModule } from '@angular/material/table';
import { ToastModule } from 'primeng/toast';
import { CompServiceService } from '../../../services/comp-service.service';

@Component({
  selector: 'app-comp-dash',
  standalone: true,
  imports: [CommonModule, DragDropModule, HttpClientModule,RouterModule,FormsModule,ReactiveFormsModule,MatTableModule,
    CommonModule, MatIconModule,
    MatButton, MatCheckbox,
    MatTooltip,
    MatFormFieldModule,
    MatInputModule,
    ToastModule, PaginatorModule, TableModule, ButtonModule, CheckboxModule, TooltipModule],
  templateUrl: './comp-dash.component.html',
  styleUrl: './comp-dash.component.css',
  providers: [KanbanCompService, CompServiceService, MessageService]  
})

export class CompDashComponent implements OnInit {
  checked: any[] = [];
    columnName: string[] = ['check', 'Société', 'Secteur', 'Informations', 'État', 'Coordonnées', 'Lieu', 'Manager'];
    @Input()
    liste: any[] = [];
    interminate: boolean = false;
    allComplete: boolean = false;
    //dataSource = new MatTableDataSource<any>();
    dataSource: any[] = [];
    @Output()
    onClick = new EventEmitter<any>();

    @Output()
    refreshClick = new EventEmitter<any>();

    size: number = 10;
    page: number = 0;
    first: boolean = false;
    last: boolean = false;
    totalElements: number = 0;
    totalPages: number = 0;
    debouncedSearchValue: string = '';

    styleTable = 'p-datatable-sm'

  constructor(
    private companyService: CompServiceService,
        private messageService: MessageService,
        
        private dialog: MatDialog,
        
  ) {}

  ngOnInit(): void {
  this.listPaginate();
        
   
  }
  performSearch() {

    
}

listPaginate() {
  this.companyService.getComps().subscribe(
      (response: any) => {
          this.liste = response;
          this.dataSource = this.liste;
          console.log('Liste des sociétés:', this.liste);
      },
      (error: any) => { console.error('Erreur lors de la récupération des sociétés:', error); }
  );  
      
}





viewSite(url:any) {
    if (url.includes('http') == false)
        url = 'https://' + url;
    url.replace('http://', 'https://')
    window.open(url, '_blank');
}
viewPhone(phone :any) {
    let link = `tel:${phone}`;

    window.location.href = link;
}



deleteCompany = () => {

}


deleted() {/*
    const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '500px',
        data: {
            title: 'Voulez-vous supprimer?',
        }
    });
    dialogRef.afterClosed().subscribe(result => {
        if (result == true) this.deleteCompany();
        else return;
    });*/
}

paginate(event:any) {
    this.page = event.page;
    this.size = event.rows;
    this.totalPages = event.pageCount;
    this.listPaginate();
}


imageUrl(company:any) {/*
    return this.imageServ.getFile(company.pictureName);*/
}
}
  
