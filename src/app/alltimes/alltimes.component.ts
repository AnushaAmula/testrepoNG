import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, DataTable, LazyLoadEvent, DialogModule } from "primeng/primeng";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import Dexie from 'dexie';
import { Observable } from "rxjs";
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

const MAX_EXAMPLE_RECORDS = 1000;

@Component({
  selector: 'at-alltimes',
  templateUrl: './alltimes.component.html',
  styleUrls: ['./alltimes.component.css']
})
export class AlltimesComponent implements OnInit {

  @ViewChild("dt") dt : DataTable;

  allTimesheetData = [];

  addTimeForm: FormGroup;

  displayEntryForm = false;

  allProjectNames = ['', 'Payroll App', 'Mobile App', 'Agile Times'];

  allProjects = this.allProjectNames.map((proj) => {
    return { label: proj, value: proj }
  });

  selectedRows: Array<any>;

  contextMenu: MenuItem[];

  recordCount : number;

  displayAddDialog = false;

  constructor(private apollo: Apollo,private fb: FormBuilder) { }

  ngOnInit() {

      this.addTimeForm = this.fb.group({
        User: ['', [Validators.required]],
        Project: ['', [Validators.required]],
        Category: ['', [Validators.required]],
        StartTime: ['', [Validators.required]],
        EndTime: ['', [Validators.required]]
      })
  
    const AllClientsQuery = gql`
    query allTimesheets {
      allTimesheets {
          id
          user
          project
          category
          startTime
          endTime
        }
    }`;

    const queryObservable = this.apollo.watchQuery({

      query: AllClientsQuery,
      pollInterval:200


    }).subscribe(({ data, loading }: any) => {

      this.allTimesheetData = data.allTimesheets;
      this.recordCount = data.allTimesheets.length;

    });

  }

  onEditComplete(editInfo) {  }

    
    saveNewEntry() {
   
      const user = this.addTimeForm.value.User;
      const project = this.addTimeForm.value.Project;
      const category = this.addTimeForm.value.Category;
      const startTime = this.addTimeForm.value.StartTime;
      const endTime = this.addTimeForm.value.EndTime;
      const date = new Date();

    const createTimesheet = gql`
     mutation createTimeSheet($user:String!,$project: String!,
     $category:String!, $startTime: Int!,$endTime: Int!,$date:DateTime!)
    {
     createTimesheet(user: $user, project: $project,
                    category: $category, startTime: $startTime, 
                    endTime: $endTime, date: $date) 
                    {
                      id
                    }
    }`;
   
      this.apollo.mutate({
        mutation: createTimesheet,
        variables: {
          user: user,
          project: project,
          category: category,
          startTime: startTime,
          endTime: endTime,
          date: date
        }
      }).subscribe(({ data }) => {
        console.log('got data', data);
      }, (error) => {
        console.log('there was an error sending the query', error);
      });

        this.displayAddDialog = false;
        //this.messages.push({ severity: 'success', summary: 'Entry Created', detail: 'Your entry has been created' });
    }
  }
