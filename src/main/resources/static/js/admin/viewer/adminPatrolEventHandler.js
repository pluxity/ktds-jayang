const adminPatrolButtonEvent = (() => {

    let currentPatrolNumber = 0;

    let isPaused = false;

    let isFinished = false;

    let index = 0;

    let currentPatrol = -1;

    const init = () => {
        this.currentPatrolNumber = 0;
        this.isPaused = false;
    }

    const getCurrentPatrolNumber = ()  => {
        return this.currentPatrolNumber;
    }

    const setCurrentPatrolNumber = (value) => {
        this.currentPatrolNumber = Number(value);
    }

    const initializeIndex = () => {
        this.index = 0;
    }
    const getIsPaused = () => {
        return this.isPaused;
    }

    const getIsFinished = (id) => {
        const patrolPoints = PatrolManager.findById(id).patrolPoints;
        return this.currentPatrolNumber >= patrolPoints.length;
    }

    const play = (id) => {
        console.log("play")
        this.isPaused = false;

        loop(id);
    }

    const loop = async (id) => {
        if(currentPatrol !== id){
            index = 0;
            currentPatrol = id;
            setCurrentPatrolNumber(0);
        }

        const patrol = PatrolManager.findById(Number(id));

        for( let i = getCurrentPatrolNumber(); i < patrol.patrolPoints.length; i++) {

            setCurrentPatrolNumber(i);
            await move(id, patrol);


        }
    }

    const move = (id, patrol) => {
        return new Promise(function (resolve, reject) {

            if(this.isPaused) return;

            const point = patrol.patrolPoints[getCurrentPatrolNumber()];
            if( point.floorNo !== Number(document.querySelector('#floorNo').value) ) {

                document.getElementById('floorNo').value = point.floorNo;

                BuildingManager.findById(patrol.buildingId).getDetail().then((data) => {
                    const floor = data.floors.find(floor => floor.no === point.floorNo);
                    Px.Model.Visible.HideAll();
                    Px.Model.Visible.Show(floor.id);
                });

                Px.VirtualPatrol.RemoveAll();
                //remove all paths
                Px.VirtualPatrol.Editor.Off();

                Px.VirtualPatrol.Import(PatrolManager.findByIdByImport(id, point.floorNo));
                index = 0;
                const pointLocation = JSON.parse(point.pointLocation);
                Px.Camera.MoveToPosition(0, 200, pointLocation.x, pointLocation.y, pointLocation.z);
            }
            Px.VirtualPatrol.MoveTo(0, index, 200, 5000, () => {
                index++;
                return resolve();
            });



        })

    }

    const pause = () => {
        this.isPaused = true;
    }

    const stop = () => {
        setCurrentPatrolNumber(0);
        initializeIndex();
        this.isPaused = false;
    }

    return {
        init,
        getCurrentPatrolNumber,
        setCurrentPatrolNumber,
        getIsPaused,
        getIsFinished,
        play,
        loop,
        pause,
        stop
    }

})();
adminPatrolButtonEvent.init();