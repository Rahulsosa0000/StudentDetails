package com.studreg.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "students")
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String firstName;
    private String lastName;
    private String gender;
    private String address;
    
    
    //@JdbcTypeCode annotation tells Hibernate how to map the Java field to a SQL column
    //SqlTypes.JSON → This specifies that the field will be stored in JSON format.

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)    // // field store in JSON format
    private JsonNode education;   //  represent json data 
    
    public Student() {
		super();
	
	}
    

	public Student(Long id, String firstName, String lastName, String gender, String address, JsonNode education) {
		super();
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.gender = gender;
		this.address = address;
		this.education = education;
	}


	
    // Getters and Setters
    public JsonNode getEducation() {
        return education;
    }

    public void setEducation(JsonNode education) {
        this.education = education;
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	

}
