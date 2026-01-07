  nextStep(): void {
    if (this.currentStep < this.totalSteps && this.canProceedToNext()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onCancel(): void {
    this.showForm = false;
    this.dialogRef.close();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.updateFilteredItems();
  }
}
